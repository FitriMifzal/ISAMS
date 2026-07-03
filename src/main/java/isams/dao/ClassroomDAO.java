package isams.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import isams.connection.ConnectionManager;
import isams.model.Classroom;

public class ClassroomDAO {
    // do not remove
    private static Connection con = null;
    private static PreparedStatement ps = null;
    private static ResultSet rs = null;
    private static String sql;

    // Complete addClassRoom() method
    public static void addClassRoom(Classroom classRoom) {
        try {
            // call getConnection() method
            con = ConnectionManager.getConnection();

            // 3. create statement
            sql = "INSERT INTO classroom(classCode, class_name) VALUES(?, ?)";
            ps = con.prepareStatement(sql);

            ps.setString(1, classRoom.getClassCode());
            ps.setString(2, classRoom.getClassName());

            // 4. execute query
            ps.executeUpdate();

            // close connection
            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Complete updateClassRoom() method
    public static void updateClassRoom(Classroom classRoom) {
        try {
            // call getConnection() method
            con = ConnectionManager.getConnection();

            // 3. create statement
            sql = "UPDATE classroom SET classCode=?, class_name=? WHERE class_id=?";
            ps = con.prepareStatement(sql);

            ps.setString(1, classRoom.getClassCode());
            ps.setString(2, classRoom.getClassName());
            ps.setInt(3, classRoom.getClassId());

            // 4. execute query
            ps.executeUpdate();

            // close connection
            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Complete deleteClassRoom() method
    public static void deleteClassRoom(int classId) {
        try {
            // call getConnection() method
            con = ConnectionManager.getConnection();

            // 3. create statement
            sql = "DELETE FROM classroom WHERE class_id=?";
            ps = con.prepareStatement(sql);
            ps.setInt(1, classId);

            // 4. execute query
            ps.executeUpdate();

            // close connection
            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Complete getClassRoom() method
    public static Classroom getClassRoom(int classId) {
        Classroom classRoom = null;
        try {
            // call getConnection() method
            con = ConnectionManager.getConnection();

            // 3. create statement
            sql = "SELECT * FROM classroom WHERE class_id=?";
            ps = con.prepareStatement(sql);
            ps.setInt(1, classId);

            // 4. execute query
            rs = ps.executeQuery();

            if (rs.next()) {
                classRoom = new Classroom();
                classRoom.setClassId(rs.getInt("class_id"));
                classRoom.setClassCode(rs.getString("classCode"));
                classRoom.setClassName(rs.getString("class_name"));
            }

            // close connection
            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return classRoom;
    }

    // Complete getClasses() method - used to populate dropdowns
    public static List<Classroom> getClasses() {
        List<Classroom> classes = new ArrayList<Classroom>();
        try {
            // call getConnection() method
            con = ConnectionManager.getConnection();

            // 3. create statement
            sql = "SELECT * FROM classroom";
            ps = con.prepareStatement(sql);

            // 4. execute query
            rs = ps.executeQuery();

            while (rs.next()) {
                Classroom classRoom = new Classroom();
                classRoom.setClassId(rs.getInt("class_id"));
                classRoom.setClassCode(rs.getString("classCode"));
                classRoom.setClassName(rs.getString("class_name"));
                classes.add(classRoom);
            }

            // close connection
            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return classes;
    }
}