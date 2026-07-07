/* ============================================================
   UPDATESTUDENT.JS — Page-specific logic
   User profile initialization handled by Sidebar.js
   ============================================================ */

   let currentStudentType = "";

   document.addEventListener('DOMContentLoaded', function () {
       loadClassDropdown();
       loadStudentData();
   });

   function loadClassDropdown() {
       const clsSelect = document.getElementById("cls");

       fetch("../ClassroomController?action=list")
           .then(response => response.json())
           .then(classes => {
               clsSelect.innerHTML = `<option value="">-- Select Class --</option>`;

               classes.forEach(c => {
                   const option = document.createElement("option");
                   option.value = c.classId;
                   option.textContent = c.classCode + " - " + c.className;
                   clsSelect.appendChild(option);
               });
           });
   }

   function loadStudentData() {
       const id = new URLSearchParams(window.location.search).get("id");

       fetch("../StudentController?action=get&id=" + id)
           .then(response => response.json())
           .then(student => {
               document.getElementById("stuId").value = student.stuId;
               document.getElementById("name").value = student.stuName || "";
               document.getElementById("ic").value = student.stuIC || "";
               document.getElementById("address").value = student.stuAdd || "";
               document.getElementById("No").value = student.stuPhoneNum || "";
               document.getElementById("studentType").value = student.studentType || "";

               currentStudentType = student.studentType;

               setTimeout(() => {
                   document.getElementById("cls").value = student.classId;
               }, 300);

               if (currentStudentType === "SVM") {
                   document.getElementById("svmFields").style.display = "block";
                   document.getElementById("dvmFields").style.display = "none";

                   document.getElementById("cgpaA").value = student.cgpaA || "";
                   document.getElementById("cgpaV").value = student.cgpaV || "";
               } else if (currentStudentType === "DVM") {
                   document.getElementById("svmFields").style.display = "none";
                   document.getElementById("dvmFields").style.display = "block";

                   document.getElementById("repeatPaper").value = student.repeatPaper || "";
               }
           });
   }

   function saveUpdate() {
       const stuId = document.getElementById("stuId").value;
       const name = document.getElementById("name").value.trim();
       const ic = document.getElementById("ic").value.trim();
       const cls = document.getElementById("cls").value;
       const address = document.getElementById("address").value.trim();
       const contactNo = document.getElementById("No").value.trim();

       if (!name || !ic || !cls || !address || !contactNo) {
           alert("Please fill in all student details.");
           return;
       }

       const formData = new URLSearchParams();
       formData.append("stuId", stuId);
       formData.append("stuName", name);
       formData.append("stuIC", ic);
       formData.append("classId", cls);
       formData.append("studentType", currentStudentType);
       formData.append("stuAdd", address);
       formData.append("stuPhoneNum", contactNo);

       if (currentStudentType === "SVM") {
           formData.append("cgpaA", document.getElementById("cgpaA").value);
           formData.append("cgpaV", document.getElementById("cgpaV").value);
       }

       if (currentStudentType === "DVM") {
           formData.append("repeatPaper", document.getElementById("repeatPaper").value);
       }

       fetch("../StudentController?action=update", {
           method: "POST",
           headers: {
               "Content-Type": "application/x-www-form-urlencoded"
           },
           body: formData.toString()
       })
       .then(response => response.text())
       .then(result => {
           if (result.trim() === "success") {
               alert("Student updated successfully.");
               window.location.href = "../Student-List/StudentList.html";
           } else {
               alert("Update failed: " + result);
           }
       });
   }