/**
 * ONEGOV — Notifications Center Controller (notifications.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("notifications-list-container");
  const markAllBtn = document.getElementById("mark-all-read-btn");

  function renderNotifications() {
    const notifs = getData("notifications", []);

    if (notifs.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 48px; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔔</div>
          <p style="font-size: 1.05rem; font-weight: 600;">No notifications found.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = notifs.map(n => {
      let icon = "ℹ️";
      let iconClass = "info";

      if (n.type === "success") {
        icon = "✓";
        iconClass = "success";
      } else if (n.type === "warning") {
        icon = "⚠";
        iconClass = "warning";
      }

      return `
        <div class="notification-card ${n.read ? '' : 'unread'}" data-id="${n.id}">
          <div class="notification-icon ${iconClass}">
            ${icon}
          </div>
          <div class="notification-body">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <h4 style="font-size: 1rem; color: var(--text-navy-primary); margin-bottom: 4px;">
                ${n.title}
              </h4>
              ${!n.read ? '<span class="badge badge-blue">New</span>' : ''}
            </div>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 6px;">
              ${n.desc}
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="notification-time">⏱️ ${n.time}</span>
              ${!n.read ? `
                <button class="btn btn-outline btn-sm mark-read-btn" data-id="${n.id}" style="padding: 3px 10px; font-size: 0.78rem;">
                  Mark as Read
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events for individual mark as read
    document.querySelectorAll(".mark-read-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const notifId = btn.getAttribute("data-id");
        const list = getData("notifications", []);
        const target = list.find(item => item.id === notifId);
        if (target) {
          target.read = true;
          saveData("notifications", list);
          renderNotifications();
        }
      });
    });
  }

  // Mark all as read
  if (markAllBtn) {
    markAllBtn.addEventListener("click", () => {
      const list = getData("notifications", []);
      list.forEach(item => item.read = true);
      saveData("notifications", list);
      renderNotifications();
    });
  }

  renderNotifications();
});
