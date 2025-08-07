document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', () => {
        const codeBlock = button.parentNode.querySelector('code');
        navigator.clipboard.writeText(codeBlock.textContent);

        // Change button text temporarily
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.backgroundColor = 'var(--apple-blue)';
        button.style.color = 'white';

        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
            button.style.color = '';
        }, 2000);
    });
});