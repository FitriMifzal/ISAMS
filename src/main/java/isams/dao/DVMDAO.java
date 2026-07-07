package isams.dao;
import java.sql.*;
import isams.connection.ConnectionManager;
import isams.model.DVM;
public class DVMDAO {
    public static void upsertDVM(DVM dvm) {
        try {
            Connection con = ConnectionManager.getConnection();
            String checkSql = "SELECT 1 FROM DVM WHERE STU_ID=?";
            PreparedStatement check = con.prepareStatement(checkSql);
            check.setInt(1, dvm.getStuId());
            ResultSet rs = check.executeQuery();
            if (rs.next()) {
                String sql = "UPDATE DVM SET REPEATPAPER=? WHERE STU_ID=?";
                PreparedStatement ps = con.prepareStatement(sql);
                ps.setInt(1, dvm.getRepeatPaper());
                ps.setInt(2, dvm.getStuId());
                ps.executeUpdate();
            } else {
                String sql = "INSERT INTO DVM (STU_ID, REPEATPAPER) VALUES (?, ?)";
                PreparedStatement ps = con.prepareStatement(sql);
                ps.setInt(1, dvm.getStuId());
                ps.setInt(2, dvm.getRepeatPaper());
                ps.executeUpdate();
            }
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}