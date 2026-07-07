package isams.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import isams.connection.ConnectionManager;


public class RegisterDAO {

    // register a student into a subject, skipping if already registered
    // (single atomic query - avoids a race between checking and inserting)
    public static void enrollStudent(int subId, int stuId) {
        try {
            Connection con = ConnectionManager.getConnection();
            String sql =
                "INSERT INTO register (sub_id, stu_id) " +
                "SELECT ?, ? FROM dual " +
                "WHERE NOT EXISTS ( " +
                "SELECT 1 FROM register " +
                "WHERE sub_id = ? AND stu_id = ? " +
                ")";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, subId);
            ps.setInt(2, stuId);
            ps.setInt(3, subId);
            ps.setInt(4, stuId);
            ps.executeUpdate();
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}