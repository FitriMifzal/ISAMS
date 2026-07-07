package isams.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import isams.connection.ConnectionManager;

public class RegisterDAO {

    public static void enrollStudent(int subId, int stuId, int classId) {
        try {
            Connection con = ConnectionManager.getConnection();

            String sql =
                "INSERT INTO register (sub_id, stud_id, class_id) " +
                "SELECT ?, ?, ? FROM dual " +
                "WHERE NOT EXISTS ( " +
                "SELECT 1 FROM register " +
                "WHERE sub_id = ? AND stud_id = ? AND class_id = ? " +
                ")";

            PreparedStatement ps = con.prepareStatement(sql);

            ps.setInt(1, subId);
            ps.setInt(2, stuId);
            ps.setInt(3, classId);

            ps.setInt(4, subId);
            ps.setInt(5, stuId);
            ps.setInt(6, classId);

            ps.executeUpdate();
            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}