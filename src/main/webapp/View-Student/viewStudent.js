/* ============================================================
   VIEWSTUDENT.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

   document.addEventListener('DOMContentLoaded', function () {
       sessionStorage.setItem('profile_return_url', window.location.href);

       if (localStorage.getItem('isLoggedIn') !== 'true') {
           window.location.href = "../Create-Account/CreateAccount.html";
           return;
       }

       loadStudentData();
   });

   function loadStudentData() {
       const urlParams = new URLSearchParams(window.location.search);
       const id = urlParams.get("id");

       if (!id) {
           alert("Student ID not found!");
           window.location.href = "../Student-List/StudentList.html";
           return;
       }

       fetch("../StudentController?action=get&id=" + id)
           .then(response => response.json())
           .then(student => {
               document.getElementById("v_name").innerText = student.stuName || "N/A";
               document.getElementById("v_ic").innerText = student.stuIC || "N/A";
               document.getElementById("v_cls").innerText = student.classCode || "N/A";
               document.getElementById("v_address").innerText = student.stuAdd || "N/A";
               document.getElementById("v_No").innerText = student.stuPhoneNum || "N/A";
           })
           .catch(error => {
               console.error(error);
               alert("Failed to load student data!");
           });
   }