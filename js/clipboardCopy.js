//used to copy the llms-full.txt file to the clipboard in the footer
document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelector('.llms-copy-button')
    .addEventListener('click', async (event) => {
      try {
        const response = await fetch(
          // TODO Update URL for production
          'http://127.0.0.1:8000/llms-full.txt'
        );
        const text = await response.text();
        await navigator.clipboard.writeText(text);

        const copiedToClipboard = document.querySelector('.md-dialog');
        copiedToClipboard.classList.add('md-dialog--active');
        const copiedToClipboardMessage =
          copiedToClipboard.querySelector('.md-dialog__inner');
        if (copiedToClipboardMessage) {
          copiedToClipboardMessage.textContent = 'Copied to clipboard';
        }
        // Set a timer to remove the after 2 seconds (2000ms)
        setTimeout(() => {
          copiedToClipboard.classList.remove('md-dialog--active');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        if (copiedToClipboard) {
          copiedToClipboard.classList.remove('md-dialog--active');
        }
      }
    });
});