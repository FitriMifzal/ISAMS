package isams.dao;

import java.sql.*;
import isams.connection.ConnectionManager;
import isams.model.SVM;

public class SVMDAO {

    public static void upsertSVM(SVM svm) {
        try {
            Connection con = ConnectionManager.getConnection();

            String checkSql = "SELECT 1 FROM SVM WHERE STUD_ID=?";
            PreparedStatement check = con.prepareStatement(checkSql);
            check.setInt(1, svm.getStuId());
            ResultSet rs = check.executeQuery();

            if (rs.next()) {
                String sql = "UPDATE SVM SET CGPA_A=?, CGPA_V=? WHERE STUD_ID=?";
                PreparedStatement ps = con.prepareStatement(sql);
                ps.setDouble(1, svm.getCgpaA());
                ps.setDouble(2, svm.getCgpaV());
                ps.setInt(3, svm.getStuId());
                ps.executeUpdate();
            } else {
                String sql = "INSERT INTO SVM (STUD_ID, CGPA_A, CGPA_V) VALUES (?, ?, ?)";
                PreparedStatement ps = con.prepareStatement(sql);
                ps.setInt(1, svm.getStuId());
                ps.setDouble(2, svm.getCgpaA());
                ps.setDouble(3, svm.getCgpaV());
                ps.executeUpdate();
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}