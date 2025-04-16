import React, { useEffect, useState } from 'react';
import UserFormModal from '../components/UserFormModal';
import {
  Grid,
  Table,
  TableHeaderRow,
  TableSelection,
  PagingPanel,
} from '@devexpress/dx-react-grid-material-ui';
import {
  SearchState,
  IntegratedFiltering,
  SelectionState,
  PagingState,
  IntegratedPaging
} from '@devexpress/dx-react-grid';
import {
  Paper,
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  Menu,
  IconButton,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Button from '../components/ui/Button';
import API from '../services/api';
import '../styles/UserList.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import UserHistory from './UserHistory';

export default function UserList() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [selection, setSelection] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [userHistory, setUserHistory] = useState(null);
  const [showUserHistory, setShowUserHistory] = useState(false);

  const navigate = useNavigate();

  const columns = [
    { name: 'email', title: 'Email' },
    { name: 'role', title: 'Uloga' },
    { name: 'isActive', title: 'Aktivan' },
    { name: 'akcija', title: 'Akcija' },
  ];

  const handleOpenExportMenu = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportMenuAnchor(null);
  };

  const handleAuditLog = () => {
    navigate("/audit-logs");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = statusFilter === ''
      ? rows
      : rows.filter((r) => r.isActive === statusFilter);
    setFilteredRows(filtered);
  }, [rows, statusFilter]);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      const data = res.data.map(user => ({
        ...user,
        isActive: user.isActive ? 'Da' : 'Ne',
      }));
      setRows(data);
    } catch (err) {
      console.error('Greška pri dohvaćanju korisnika:', err);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = () => {
    if (selection.length === 1) {
      const userId = selection[0];
      const user = filteredRows.find(u => u.id === userId);
      setEditingUser(user);
      setIsModalOpen(true);
    }
  };

  const handleDeleteUser = async () => {
    if (selection.length !== 1) return;

    const user = filteredRows.find(u => u.id === selection[0]);
    if (!user) return;

    const confirmed = window.confirm(`Da li ste sigurni da želite obrisati korisnika "${user.email}"?`);
    if (!confirmed) return;

    try {
      await API.delete(`/users/${user.id}`);
      fetchUsers();
      setSelection([]);
    } catch (err) {
      console.error('Greška pri brisanju korisnika:', err);
    }
  };

  const handleExport = (format) => {
    const exportData = filteredRows.map(({ email, role, isActive }) => ({
      email,
      role,
      isActive,
    }));

    if (format === 'csv') {
      const csv = [
        ['Email', 'Uloga', 'Aktivan'],
        ...exportData.map(row => [row.email, row.role, row.isActive]),
      ]
        .map(row => row.join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'korisnici.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Korisnici');
      XLSX.writeFile(workbook, 'korisnici.xlsx');
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Email', 'Uloga', 'Aktivan']],
        body: exportData.map(({ email, role, isActive }) => [email, role, isActive]),
      });
      doc.save('korisnici.pdf');
    }

    handleCloseExportMenu();
  };

  const handleUserHistory = () => {
    if (selection.length === 1) {
      const userId = selection[0];
      setUserHistory(userId);
      setShowUserHistory(true);
    }
  };

  return (
    <>
      <Box className="userlist-container">
        <Typography variant="h3" className="userlist-title" align="center" >Korisnici</Typography>

        <Box className="userlist-top-bar">
          <input
            type="text"
            placeholder="Pretraži korisnike..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="userlist-search"
          />
          <Box className="userlist-actions">
            <Button onClick={handleAuditLog}>Audit Log</Button>
            <Button onClick={handleAddUser}>Dodaj korisnika</Button>
            <Button onClick={handleEditUser} disabled={selection.length !== 1}>
              Izmijeni
            </Button>
            <Button onClick={handleDeleteUser} disabled={selection.length !== 1}>
              Obriši
            </Button>
          </Box>
          <IconButton onClick={handleOpenExportMenu} title="Izvoz">
            <FileDownloadIcon />
          </IconButton>
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={handleCloseExportMenu}
          >
            <MenuItem onClick={() => handleExport('csv')}>CSV</MenuItem>
            <MenuItem onClick={() => handleExport('excel')}>Excel</MenuItem>
            <MenuItem onClick={() => handleExport('pdf')}>PDF</MenuItem>
          </Menu>

          <FormControl className="userlist-status-filter">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              renderValue={(selected) => {
                if (selected === '') return 'Svi korisnici';
                return selected === 'Da' ? 'Aktivni korisnici' : 'Neaktivni korisnici';
              }}
            >
              <MenuItem value="">Svi korisnici</MenuItem>
              <MenuItem value="Da">Aktivni korisnici</MenuItem>
              <MenuItem value="Ne">Neaktivni korisnici</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Paper elevation={4} className="userlist-table">
          <Grid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.id}
          >
            <SearchState value={searchValue} onValueChange={setSearchValue} />
            <SelectionState
              selection={selection}
              onSelectionChange={(newSelection) => {
                const lastSelected = newSelection[newSelection.length - 1];
                setSelection(newSelection.length === 1 ? [lastSelected] : []);
              }}
              selectByRowClick
            />
            <PagingState
              currentPage={currentPage}
              onCurrentPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
            <IntegratedFiltering />
            <IntegratedPaging />

            <Table
              rowComponent={({ tableRow, row, ...restProps }) => {
                const rowId = tableRow.rowId;
                const isSelected = selection.includes(rowId);
                return (
                  <Table.Row
                    {...restProps}
                    onClick={() => setSelection([rowId])}
                    onDoubleClick={() => {
                      const currentRow = filteredRows.find(r => r.id === rowId);
                      if (currentRow) {
                        setEditingUser(currentRow);
                        setIsModalOpen(true);
                      }
                    }}
                    className={`userlist-table-row ${isSelected ? 'selected' : ''}`}
                  />
                );
              }}
              cellComponent={(props) => {
                const { column, row } = props;

                if (column.name === 'akcija') {
                  return (
                    <Table.Cell {...props}>
                      <Button
                        size="small"
                        onClick={() => {
                          setUserHistory(row.id);
                          setShowUserHistory(true);
                        }}
                      >
                        Istorija
                      </Button>
                    </Table.Cell>
                  );
                }

                return <Table.Cell {...props} />;
              }}
            />

            <TableHeaderRow />

            <TableSelection showSelectAll={false} showSelectionColumn={false} highlightSelected />

            <PagingPanel />
          </Grid>
        </Paper>
      </Box>

      <UserFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={fetchUsers}
        initialData={editingUser}
      />
      {showUserHistory && userHistory && (
        <UserHistory
          userId={userHistory}
          onClose={() => setShowUserHistory(false)}
        />
      )}
    </>
  );

}