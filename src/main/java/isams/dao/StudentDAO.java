package isams.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import isams.connection.ConnectionManager;
import isams.model.Student;

public class StudentDAO {

    // Removed global static connection variables to prevent multi-user threading crashes

    public static void addStudent(Student student) {
        String sql = "INSERT INTO student(stu_name, stu_ic, stu_add, stu_phonenum, class_id, student_type) "
                   + "VALUES (?, ?, ?, ?, ?, ?)";
        
        // Using try-with-resources auto-closes connections, statements, and prevents leaks
        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {
            
            ps.setString(1, student.getStuName());
            ps.setString(2, student.getStuIC());
            ps.setString(3, student.getStuAdd());
            ps.setString(4, student.getStuPhoneNum());
            ps.setInt(5, student.getClassId());
            ps.setString(6, student.getStudentType());
            ps.executeUpdate();

            // Fetch the auto-generated student ID to insert the subtype record immediately
            try (ResultSet generatedKeys = ps.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    int newStuId = generatedKeys.getInt(1);
                    
                    // Enforce the {Mandatory} constraint right here!
                    if ("SVM".equalsIgnoreCase(student.getStudentType())) {
                        String svmSql = "INSERT INTO SVM (STU_ID, CGPA_A, CGPA_V) VALUES (?, ?, ?)";
                        try (PreparedStatement psSub = con.prepareStatement(svmSql)) {
                            psSub.setInt(1, newStuId);
                            psSub.setDouble(2, student.getCgpaA());
                            psSub.setDouble(3, student.getCgpaV());
                            psSub.executeUpdate();
                        }
                    } else if ("DVM".equalsIgnoreCase(student.getStudentType())) {
                        String dvmSql = "INSERT INTO DVM (STU_ID, REPEATPAPER) VALUES (?, ?)";
                        try (PreparedStatement psSub = con.prepareStatement(dvmSql)) {
                            psSub.setInt(1, newStuId);
                            psSub.setInt(2, student.getRepeatPaper());
                            psSub.executeUpdate();
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void updateStudent(Student student) {
        // Fixed: added student_type=? to match your 6 parameters and update the subtype flag if it changes
        String sql = "UPDATE student SET stu_name=?, stu_ic=?, stu_add=?, stu_phonenum=?, class_id=?, student_type=? "
                   + "WHERE stu_id=?";

        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setString(1, student.getStuName());
            ps.setString(2, student.getStuIC());
            ps.setString(3, student.getStuAdd());
            ps.setString(4, student.getStuPhoneNum());
            ps.setInt(5, student.getClassId());
            ps.setString(6, student.getStudentType());
            ps.setInt(7, student.getStuId()); // Now correctly matches the index sequence

            ps.executeUpdate();
            
            // Sync up subtype tables if attributes change
            if ("SVM".equalsIgnoreCase(student.getStudentType())) {
                String upsertSvm = "INSERT INTO SVM (STU_ID, CGPA_A, CGPA_V) VALUES (?, ?, ?) "
                                 + "ON DUPLICATE KEY UPDATE CGPA_A=?, CGPA_V=?";
                try (PreparedStatement psSub = con.prepareStatement(upsertSvm)) {
                    psSub.setInt(1, student.getStuId());
                    psSub.setDouble(2, student.getCgpaA());
                    psSub.setDouble(3, student.getCgpaV());
                    psSub.setDouble(4, student.getCgpaA());
                    psSub.setDouble(5, student.getCgpaV());
                    psSub.executeUpdate();
                }
            } else if ("DVM".equalsIgnoreCase(student.getStudentType())) {
                String upsertDvm = "INSERT INTO DVM (STU_ID, REPEATPAPER) VALUES (?, ?) "
                                 + "ON DUPLICATE KEY UPDATE REPEATPAPER=?";
                try (PreparedStatement psSub = con.prepareStatement(upsertDvm)) {
                    psSub.setInt(1, student.getStuId());
                    psSub.setInt(2, student.getRepeatPaper());
                    psSub.setInt(3, student.getRepeatPaper());
                    psSub.executeUpdate();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void deleteStudent(int stuId) {
        String[] sqlList = {
            "DELETE FROM SVM WHERE STU_ID=?",
            "DELETE FROM DVM WHERE STU_ID=?",
            "DELETE FROM ATTENDANCE WHERE STU_ID=?",
            "DELETE FROM REGISTER WHERE STU_ID=?",
            "DELETE FROM STUDENT WHERE STU_ID=?"
        };

        try (Connection con = ConnectionManager.getConnection()) {
            for (String q : sqlList) {
                try (PreparedStatement ps = con.prepareStatement(q)) {
                    ps.setInt(1, stuId);
                    ps.executeUpdate();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static Student getStudent(int id) {
        Student student = null;
        String sql = "SELECT s.stu_id, s.stu_name, s.stu_ic, s.stu_add, s.stu_phonenum, "
                   + "s.class_id, s.student_type, c.classcode, c.class_name, "
                   + "svm.cgpa_a, svm.cgpa_v, dvm.repeatpaper "
                   + "FROM student s "
                   + "LEFT JOIN classroom c ON s.class_id = c.class_id "
                   + "LEFT JOIN svm ON s.stu_id = svm.stu_id "
                   + "LEFT JOIN dvm ON s.stu_id = dvm.stu_id "
                   + "WHERE s.stu_id = ?";

        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    student = new Student();
                    student.setStuId(rs.getInt("stu_id"));
                    student.setStuName(rs.getString("stu_name"));
                    student.setStuIC(rs.getString("stu_ic"));
                    student.setStuAdd(rs.getString("stu_add"));
                    student.setStuPhoneNum(rs.getString("stu_phonenum"));
                    student.setClassId(rs.getInt("class_id"));
                    student.setStudentType(rs.getString("student_type"));
                    student.setClassCode(rs.getString("classcode"));
                    student.setClassName(rs.getString("class_name"));

                    double cgpaA = rs.getDouble("cgpa_a");
                    if (!rs.wasNull()) student.setCgpaA(cgpaA);

                    double cgpaV = rs.getDouble("cgpa_v");
                    if (!rs.wasNull()) student.setCgpaV(cgpaV);

                    int repeatPaper = rs.getInt("repeatpaper");
                    if (!rs.wasNull()) student.setRepeatPaper(repeatPaper);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return student;
    }

    public static List<Student> getStudents() {
        List<Student> students = new ArrayList<>();
        String sql = "SELECT s.*, c.classcode, c.class_name FROM student s "
                   + "JOIN classroom c ON s.class_id = c.class_id ORDER BY s.stu_id";

        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                Student student = new Student();
                student.setStuId(rs.getInt("stu_id"));
                student.setStuName(rs.getString("stu_name"));
                student.setStuIC(rs.getString("stu_ic"));
                student.setStuAdd(rs.getString("stu_add"));
                student.setStuPhoneNum(rs.getString("stu_phonenum"));
                student.setClassId(rs.getInt("class_id"));
                student.setStudentType(rs.getString("student_type"));
                student.setClassCode(rs.getString("classcode"));
                student.setClassName(rs.getString("class_name"));
                students.add(student);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return students;
    }
}