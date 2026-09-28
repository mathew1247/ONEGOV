/**
 * ONEGOV — Category Selection Behavior (category.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const categoryCards = document.querySelectorAll(".category-card");

  categoryCards.forEach(card => {
    card.addEventListener("click", () => {
      const selectedCategory = card.getAttribute("data-category");
      if (selectedCategory) {
        // Save category choice
        saveData("category", selectedCategory);
        
        // Update user profile category field as well
        const profile = getCurrentUser();
        profile.category = selectedCategory;
        saveData("userProfile", profile);

        // Redirect to profile setup
        redirectTo("profile.html");
      }
    });
  });
});
