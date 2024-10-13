document.addEventListener('DOMContentLoaded', () => {
  const finishButton = document.getElementById('finishOnboarding');

  finishButton.addEventListener('click', () => {
    // Set a flag in storage indicating that the onboarding is complete
    chrome.storage.local.set({ onboardingComplete: true }, () => {
      console.log('Onboarding finished and flag set.');
      // Redirect to the main options page
      window.location.href = 'options.html';
    });
  });
});
