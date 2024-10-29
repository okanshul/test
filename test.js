const forms = document.getElementsByTagName('form')[0].addEventListener('submit', Form_Submit);

function Form_Submit(event) {
    event.preventDefault();
    // Clear previous validation errors
    const invalidFields = document.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => {
        field.classList.remove('is-invalid');
        field.nextElementSibling.innerHTML = ''; // Clear previous error messages
    });
    // Form submit for fech method
    fetch(event.target.action, {
        method: 'POST',
        body: new FormData(event.target)
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not OK');
    }).then(data => {
        // errror message for invalid data
        if (data.status == 400) {
            // console.log(data.errors);
            for (const [key, value] of Object.entries(data.errors)) {
                document.getElementById(key).classList.add('is-invalid');
                document.getElementById(key).parentElement.insertAdjacentHTML('beforeend', `<div class="invalid-feedback fs-0 ms-3">${value[0]}</div>`);
            }
        }
        // success message for valid data
        if (data.status == 200) {
            window.location.href = "{{ route('admin.dashboard') }}";
        }
    }).catch(error => {
        alert(error);
    });
};
