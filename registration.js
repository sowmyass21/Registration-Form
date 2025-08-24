// --- Form Submission ---
const regForm = document.getElementById("regForm");

if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      fullname: document.getElementById("fullname").value,
      regdate: document.getElementById("regdate").value,
      programme: document.querySelector('input[name="programme"]:checked').value,
      department: document.getElementById("department").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      altphone: document.getElementById("altphone").value
    };

    await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    alert("Registration successful!");
    e.target.reset();

    // Update table if exists
    const usersTable = document.getElementById("usersTable");
    const userCountEl = document.getElementById("userCount");

    if (usersTable && userCountEl) {
      const tbody = usersTable.querySelector("tbody");
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.fullname}</td>
        <td>${data.regdate}</td>
        <td>${data.programme}</td>
        <td>${data.department}</td>
        <td>${data.email}</td>
        <td>${data.phone}</td>
        <td>${data.altphone}</td>
      `;
      tbody.appendChild(row);

      const currentCount = parseInt(userCountEl.textContent.split(": ")[1]) || 0;
      userCountEl.textContent = `Total Users: ${currentCount + 1}`;
    }
  });
}

// --- Load Users Table ---
const usersTable = document.getElementById("usersTable");
const userCountEl = document.getElementById("userCount");

async function loadUsers() {
  if (!usersTable || !userCountEl) return;

  const res = await fetch("http://localhost:5000/all-data");
  const users = await res.json();

  const tbody = usersTable.querySelector("tbody");
  tbody.innerHTML = "";

  users.forEach((u,index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index+1}</td>
      <td>${u.fullname}</td>
      <td>${u.regdate ? u.regdate.split("T")[0] : ""}</td>
      <td>${u.programme}</td>
      <td>${u.department}</td>
      <td>${u.email}</td>
      <td>${u.phone}</td>
      <td>${u.altphone}</td>
    `;
    tbody.appendChild(row);
  });

  userCountEl.textContent = `Total Users: ${users.length}`;
}

if (usersTable) loadUsers();

// --- Download Excel ---
const downloadBtn = document.getElementById("downloadExcel");
if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    window.location.href = "http://localhost:5000/export";
  });
}
