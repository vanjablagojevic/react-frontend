// === VALIDACIJE ZA REGISTRACIJU / KORISNIKE ===
export const validateField = (name, value, allValues = {}, isEdit = false) => {
  let error = '';

  const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;

  switch (name) {
    case 'email':
      if (!value) {
        error = 'Email je obavezan.';
      } else if (!emailRegex.test(value)) {
        error = 'Email mora biti u formatu email@domena.com.';
      }
      break;

    case 'password':
      if (!isEdit) {
        if (!value) {
          error = 'Lozinka je obavezna.';
        } else if (value.length < 6) {
          error = 'Lozinka mora imati barem 6 znakova.';
        }
      }
      break;

    case 'confirmPassword':
      if (!value) {
        error = 'Potvrda lozinke je obavezna.';
      } else if (value !== allValues.password) {
        error = 'Lozinke se ne podudaraju.';
      }
      break;

    case 'role':
      if (!value) {
        error = 'Uloga je obavezna.';
      }
      break;

    default:
      break;
  }

  return error;
};

export const validateForm = (values, isEdit = false) => {
  const errors = {};

  for (const name in values) {
    if (!Object.prototype.hasOwnProperty.call(values, name)) continue;

    const value = values[name];
    const error = validateField(name, value, values, isEdit);
    if (error) {
      errors[name] = error;
    }
  }

  return errors;
};



// === VALIDACIJE ZA PROFIL I IZMJENU LOZINKE ===
// (nazivi su jasno odvojeni)
export function validateProfileField(name, value) {
  switch (name) {
    case "email":
      if (!value) return "Email je obavezan.";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Neispravan format emaila.";
      break;
    case "currentPassword":
      if (!value) return "Trenutna lozinka je obavezna.";
      break;
    case "newPassword":
      if (!value) return "Nova lozinka je obavezna.";
      if (value.length < 6) return "Lozinka mora imati barem 6 karaktera.";
      break;
    case "confirmNewPassword":
      if (!value) return "Potvrda lozinke je obavezna.";
      break;
    default:
      return null; // za ostala polja ne vraćamo grešku
  }
  return null;
}

export function validateProfileForm(values, requiredFields = []) {
  const errors = {};
  for (const key of requiredFields) {
    const error = validateProfileField(key, values[key]);
    if (error) errors[key] = error;
  }
  return errors;
}

export function validateProfilePasswordChange(values) {
  const errors = validateProfileForm(values, ["currentPassword", "newPassword", "confirmPassword"]);
  if (
    values.newPassword &&
    values.confirmPassword &&
    values.newPassword !== values.confirmPassword
  ) {
    errors.confirmPassword = "Lozinke se ne poklapaju.";
  }
  return errors;
}
