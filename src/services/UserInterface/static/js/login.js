document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('.input');
  const button = document.querySelector('.login__button');

  const handleFocus = ({ target }) => {
      const span = target.previousElementSibling;
      if (span) {
          span.classList.add('span-active');
      }
  }

  const handleFocusOut = ({ target }) => {
      if (target.value === '') {
          const span = target.previousElementSibling;
          if (span) {
              span.classList.remove('span-active');
          }
      }
  }

  const handleChange = () => {
      const [username, password] = inputs;

      if (username.value && password.value.length) {
          button.removeAttribute('disabled');
      } else {
          button.setAttribute('disabled', '');
      }
  }

  inputs.forEach((input) => {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleFocusOut);
      input.addEventListener('input', handleChange);
  });
});
