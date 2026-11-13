// Layar Masuk (cukup nama panggilan) dan Ubah Nama.
import { navigate } from '../router.js';
import {
  currentName, NAME_MAX, signIn, validateName,
} from '../profile.js';
import { slideTo } from '../transition.js';
import { h } from '../ui.js';

/**
 * @param {HTMLElement} container
 * @param {{ edit?: boolean }} options  edit = true → mode "Ubah nama" dari halaman Progres
 */
export function render(container, { edit = false } = {}) {
  const errorId = 'name-error';
  const input = h('input', {
    id: 'nickname',
    name: 'nickname',
    class: 'input',
    type: 'text',
    inputmode: 'text',
    autocomplete: 'nickname',
    autocapitalize: 'words',
    spellcheck: 'false',
    maxlength: NAME_MAX + 10, // beri ruang spasi berlebih; panjang sebenarnya dicek validateName
    placeholder: 'Contoh: Nadia',
    value: edit ? currentName() : '',
    'aria-describedby': `${errorId} name-hint`,
    required: true,
  });
  const error = h('p', { id: errorId, class: 'field__error', 'aria-live': 'polite' });

  const showError = (message) => {
    error.textContent = message ?? '';
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };

  input.addEventListener('input', () => {
    if (input.hasAttribute('aria-invalid')) showError(validateName(input.value).ok ? '' : error.textContent);
  });

  const form = h('form', {
    class: 'auth-form',
    novalidate: true,
    onSubmit: (event) => {
      event.preventDefault();
      const result = signIn(input.value);
      if (!result.ok) {
        showError(result.error);
        input.focus();
        return;
      }
      if (edit) navigate('/progres');
      else slideTo('#/'); // maskot meluncur di perosotan lalu masuk ke Beranda
    },
  },
  h('div', { class: 'field' },
    h('label', { for: 'nickname', class: 'field__label' }, 'Nama'),
    input,
    error,
    h('p', { id: 'name-hint', class: 'field__hint' },
      '🔒 Namamu hanya disimpan di perangkat ini, tidak dikirim ke internet.')),
  h('button', { class: 'btn btn--primary btn--block', type: 'submit' }, edit ? 'Simpan' : 'Masuk ▶'),
  edit ? h('a', { class: 'btn btn--block', href: '#/progres' }, 'Batal') : null);

  container.append(
    h('section', { class: 'auth', 'aria-labelledby': 'auth-title' },
      h('img', {
        class: 'auth__logo', src: './assets/icons/icon-192.png', alt: '', width: 88, height: 88,
      }),
      h('h1', { id: 'auth-title', class: 'auth__title' }, edit ? 'Ubah nama' : 'Selamat datang di RELAFUN'),
      edit
        ? null
        : h('p', { class: 'auth__subtitle' },
          'Belajar relasi dan fungsi dengan cara yang seru. Tulis namamu untuk mulai.'),
      form),
  );
}

/** Varian untuk rute #/profil (ubah nama). */
export const editView = {
  render: (container) => render(container, { edit: true }),
};
