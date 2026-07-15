package isams.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import isams.connection.ConnectionManager;
import isams.model.Teacher;


public class TeacherDAO {
    // do not remove
    private static Connection con = null;
    private static PreparedStatement ps = null;
    private static ResultSet rs = null;
    private static String sql;

    // insert a new teacher (used by Create Account)
    // creatorPiId = the T_ID of the Penyelaras Intervensi who created this teacher
    public static void addTeacher(Teacher teacher, int creatorPiId) {
        try {
            con = ConnectionManager.getConnection();
            
            // ============================================================
            // FIX: LOG SQL DAN PARAMETERS
            // ============================================================
            System.out.println("=== TEACHERDAO.addTeacher ===");
            System.out.println("teacher.getTName(): " + teacher.getTName());
            System.out.println("teacher.getTIC(): " + teacher.getTIC());
            System.out.println("teacher.getTPhoneNum(): " + teacher.getTPhoneNum());
            System.out.println("teacher.getTEmail(): " + teacher.getTEmail());
            System.out.println("creatorPiId: " + creatorPiId);

            sql = "INSERT INTO teacher(t_name, t_ic, t_phonenum, t_email, t_pass, pi_id, status) "
                + "VALUES(?, ?, ?, ?, ?, ?, 'ACTIVE')";
            
            System.out.println("SQL: " + sql);
            
            ps = con.prepareStatement(sql);

            ps.setString(1, teacher.getTName());
            ps.setString(2, teacher.getTIC());
            ps.setString(3, teacher.getTPhoneNum());
            ps.setString(4, teacher.getTEmail());
            ps.setString(5, teacher.getTPass());
            ps.setInt(6, creatorPiId);

            int rowsAffected = ps.executeUpdate();
            System.out.println("Rows affected: " + rowsAffected);

            con.close();
            System.out.println("Connection closed successfully");

        } catch (Exception e) {
            System.err.println("ERROR in TeacherDAO.addTeacher:");
            e.printStackTrace();
            // Rethrow exception so controller can catch it
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    // login for Penyelaras Intervensi (PI) - identified by her own T_ID
    // she has no PI above her, so PI_ID must be NULL
    public static Teacher loginPI(String piId, String password) {
        Teacher teacher = null;
        try {
            con = ConnectionManager.getConnection();
            sql = "SELECT * FROM teacher WHERE t_id=? AND t_pass=? AND pi_id IS NULL AND status='ACTIVE'";
            ps = con.prepareStatement(sql);
            ps.setInt(1, Integer.parseInt(piId));
            ps.setString(2, password);

            rs = ps.executeQuery();

            if (rs.next()) {
                teacher = new Teacher();
                teacher.setTId(rs.getInt("t_id"));
                teacher.setPiId(null); // she has no creator PI
                teacher.setTName(rs.getString("t_name"));
                teacher.setTIC(rs.getString("t_ic"));
                teacher.setTPhoneNum(rs.getString("t_phonenum"));
                teacher.setTEmail(rs.getString("t_email"));
                teacher.setTPass(rs.getString("t_pass"));
                teacher.setStatus(rs.getString("status"));
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return teacher;
    }

    // login for regular Teacher - identified by IC, must have a creator PI
    public static Teacher loginTeacher(String tIC, String tPass) {
        Teacher teacher = null;
        try {
            con = ConnectionManager.getConnection();

            sql = "SELECT * FROM teacher WHERE t_ic=? AND t_pass=? AND pi_id IS NOT NULL AND status='ACTIVE'";
            ps = con.prepareStatement(sql);
            ps.setString(1, tIC);
            ps.setString(2, tPass);

            rs = ps.executeQuery();

            if (rs.next()) {
                teacher = new Teacher();
                teacher.setTId(rs.getInt("t_id"));

                int piId = rs.getInt("pi_id");
                teacher.setPiId(rs.wasNull() ? null : piId);

                teacher.setTName(rs.getString("t_name"));
                teacher.setTIC(rs.getString("t_ic"));
                teacher.setTPhoneNum(rs.getString("t_phonenum"));
                teacher.setTEmail(rs.getString("t_email"));
                teacher.setTPass(rs.getString("t_pass"));
                teacher.setStatus(rs.getString("status"));
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return teacher;
    }

    // update a teacher's own profile (name, phone, email only - not IC or password)
    public static void updateTeacher(Teacher teacher) {
        try {
            con = ConnectionManager.getConnection();

            sql = "UPDATE teacher SET t_name=?, t_phonenum=?, t_email=? WHERE t_id=?";
            ps = con.prepareStatement(sql);

            ps.setString(1, teacher.getTName());
            ps.setString(2, teacher.getTPhoneNum());
            ps.setString(3, teacher.getTEmail());
            ps.setInt(4, teacher.getTId());

            ps.executeUpdate();

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // get only the teachers created by (belonging to) a specific PI
    public static List<Teacher> getTeachersByPi(int piId) {
        List<Teacher> teachers = new ArrayList<Teacher>();
        try {
            con = ConnectionManager.getConnection();

            sql = "SELECT * FROM teacher WHERE pi_id=?";
            ps = con.prepareStatement(sql);
            ps.setInt(1, piId);

            rs = ps.executeQuery();

            while (rs.next()) {
                Teacher teacher = new Teacher();
                teacher.setTId(rs.getInt("t_id"));
                teacher.setTName(rs.getString("t_name"));
                teacher.setTIC(rs.getString("t_ic"));
                teacher.setTPhoneNum(rs.getString("t_phonenum"));
                teacher.setTEmail(rs.getString("t_email"));
                teacher.setStatus(rs.getString("status"));
                teachers.add(teacher);
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return teachers;
    }

    // get one teacher by id (includes status - used by Profile page)
    public static Teacher getTeacher(int tId) {
        Teacher teacher = null;
        try {
            con = ConnectionManager.getConnection();

            sql = "SELECT * FROM teacher WHERE t_id=?";
            ps = con.prepareStatement(sql);
            ps.setInt(1, tId);

            rs = ps.executeQuery();

            if (rs.next()) {
                teacher = new Teacher();
                teacher.setTId(rs.getInt("t_id"));
                teacher.setTName(rs.getString("t_name"));
                teacher.setTIC(rs.getString("t_ic"));
                teacher.setTPhoneNum(rs.getString("t_phonenum"));
                teacher.setTEmail(rs.getString("t_email"));
                teacher.setStatus(rs.getString("status"));
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return teacher;
    }

    // archive a teacher account (soft delete - keeps data, disables access)
    public static void archiveTeacher(int tId) {
        try {
            con = ConnectionManager.getConnection();

            sql = "UPDATE teacher SET status='ARCHIVED' WHERE t_id=?";
            ps = con.prepareStatement(sql);
            ps.setInt(1, tId);

            ps.executeUpdate();

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // get all teachers (used for dropdowns / display)
    public static List<Teacher> getTeachers() {
        List<Teacher> teachers = new ArrayList<Teacher>();
        try {
            con = ConnectionManager.getConnection();

            sql = "SELECT * FROM teacher";
            ps = con.prepareStatement(sql);

            rs = ps.executeQuery();

            while (rs.next()) {
                Teacher teacher = new Teacher();
                teacher.setTId(rs.getInt("t_id"));
                teacher.setTName(rs.getString("t_name"));
                teacher.setTIC(rs.getString("t_ic"));
                teacher.setTPhoneNum(rs.getString("t_phonenum"));
                teacher.setTEmail(rs.getString("t_email"));
                teacher.setStatus(rs.getString("status"));
                teachers.add(teacher);
            }


            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return teachers;
    }

    // check if an IC is already registered
    public static boolean icExists(String ic) {
        boolean exists = false;
        try {
            con = ConnectionManager.getConnection();

            sql = "SELECT COUNT(*) FROM teacher WHERE t_ic=?";
            ps = con.prepareStatement(sql);
            ps.setString(1, ic);

            rs = ps.executeQuery();

            if (rs.next()) {
                exists = rs.getInt(1) > 0;
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return exists;
    }
}