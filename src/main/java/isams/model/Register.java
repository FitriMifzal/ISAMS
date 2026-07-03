package isams.model;

import java.io.Serializable;

public class Register implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private int regId;
    private int subId;
    private int stuId;

    public Register() {
    }

    public int getRegId() {
        return regId;
    }

    public void setRegId(int regId) {
        this.regId = regId;
    }

    public int getSubId() {
        return subId;
    }

    public void setSubId(int subId) {
        this.subId = subId;
    }

    public int getStuId() {
        return stuId;
    }

    public void setStuId(int stuId) {
        this.stuId = stuId;
    }
}