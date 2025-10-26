document.addEventListener("DOMContentLoaded", () => {
  // --- Form Submission ---
  const regForm = document.getElementById("regForm");
  const submitBtn = document.querySelector(".btn");

  if (regForm) {
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
       window.location.href = "submisssion.html"; 
      // Defensive check for programme radio buttons
      const programSelected = document.querySelector('input[name="programme"]:checked');
      if (!programSelected) {
        alert("Please select a programme.");
        return;
      }

      const data = {
        fullname: document.getElementById("fullname").value,
        regdate: document.getElementById("regdate").value,
        programme: programSelected.value,
        department: document.getElementById("department").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        altphone: document.getElementById("altphone").value
      };

      try {
        const response = await fetch("http://Registration-Form.onrender.com/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error("Server responded with error status!");
         
        const resJson = await response.json();
        if (resJson && resJson.message === "registered successfully") {
          window.location.href = "submisssion.html";
        } else {
          alert("Registration failed on server!");
        }

        // Update table if exists
        updateUsersTableRow(data);

      } catch (err) {
        console.error("Registration error:", err);
        alert("Registration failed! Check console for details.");
      }
    });
  }

  // --- Load Users Table ---
  async function loadUsers() {
    const usersTable = document.getElementById("usersTable");
    const userCountEl = document.getElementById("userCount");
    if (!usersTable || !userCountEl) return;

    try {
      const res = await fetch("http://localhost:5000/all-data");
      if (!res.ok) throw new Error("Failed to fetch users.");
      const users = await res.json();

      const tbody = usersTable.querySelector("tbody");
      tbody.innerHTML = "";

      users.forEach((u, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${u.fullname}</td>
          <td>${u.regdate ? u.regdate.split("T")[0] : ""}</td>
          <td>${u.programme}</td>
          <td>${u.department}</td>
          <td>${u.email}</td>
          <td>${u.phone}</td>
          <td>${u.altphone || ""}</td>
        `;
        tbody.appendChild(row);
      });

      userCountEl.textContent = `Total Users: ${users.length}`;
    } catch (err) {
      console.error("Table load error:", err);
    }
  }

  function updateUsersTableRow(userData) {
    const usersTable = document.getElementById("usersTable");
    const userCountEl = document.getElementById("userCount");
    if (usersTable && userCountEl) {
      const tbody = usersTable.querySelector("tbody");
      const row = document.createElement("tr");
      row.innerHTML = `
        <td></td>
        <td>${userData.fullname}</td>
        <td>${userData.regdate}</td>
        <td>${userData.programme}</td>
        <td>${userData.department}</td>
        <td>${userData.email}</td>
        <td>${userData.phone}</td>
        <td>${userData.altphone}</td>
      `;
      tbody.appendChild(row);

      // Update indices
      Array.from(tbody.children).forEach((row, idx) => row.firstElementChild.textContent = idx + 1);

      // Update count
      const currentCount = tbody.children.length;
      userCountEl.textContent = `Total Users: ${currentCount}`;
    }
  }

  if (document.getElementById("usersTable")) loadUsers();

  // --- Download Excel ---
  const downloadBtn = document.getElementById("downloadExcel");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      window.location.href = "http://localhost:5000/export";
    });
  }
});
