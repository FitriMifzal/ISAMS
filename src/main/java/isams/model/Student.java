package isams.model;

import java.io.Serializable;

public class Student implements Serializable {
    private static final long serialVersionUID = 1L;

    private int stuId;
    private String stuName;
    private String stuIC;
    private String stuAdd;
    private String stuPhoneNum;
    private int classId;
    private String studentType; // "SVM" or "DVM"
    private Double cgpaA;
    private Double cgpaV;
    private Integer repeatPaper;

    // display-only fields, populated via JOIN in DAO - not stored directly on this table
    private String classCode;
    private String className;

    public Student() {
    }

    public int getStuId() {
        return stuId;
    }

    public void setStuId(int stuId) {
        this.stuId = stuId;
    }

    public String getStuName() {
        return stuName;
    }

    public void setStuName(String stuName) {
        this.stuName = stuName;
    }

    public String getStuIC() {
        return stuIC;
    }

    public void setStuIC(String stuIC) {
        this.stuIC = stuIC;
    }

    public String getStuAdd() {
        return stuAdd;
    }

    public void setStuAdd(String stuAdd) {
        this.stuAdd = stuAdd;
    }

    public String getStuPhoneNum() {
        return stuPhoneNum;
    }

    public void setStuPhoneNum(String stuPhoneNum) {
        this.stuPhoneNum = stuPhoneNum;
    }

    public int getClassId() {
        return classId;
    }

    public void setClassId(int classId) {
        this.classId = classId;
    }

    public String getStudentType() {
        return studentType;
    }

    public void setStudentType(String studentType) {
        this.studentType = studentType;
    }

    public String getClassCode() {
        return classCode;
    }

    public void setClassCode(String classCode) {
        this.classCode = classCode;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }
    public Double getCgpaA() {
        return cgpaA;
    }

    public void setCgpaA(Double cgpaA) {
        this.cgpaA = cgpaA;
    }

    public Double getCgpaV() {
        return cgpaV;
    }

    public void setCgpaV(Double cgpaV) {
        this.cgpaV = cgpaV;
    }

    public Integer getRepeatPaper() {
        return repeatPaper;
    }

    public void setRepeatPaper(Integer repeatPaper) {
        this.repeatPaper = repeatPaper;
    }
}