package isams.model;

public class SVM extends Student {
    private static final long serialVersionUID = 1L;

    private double cgpaA;
    private double cgpaV;

    public SVM() {
        super();
    }

    public double getCgpaA() {
        return cgpaA;
    }

    public void setCgpaA(double cgpaA) {
        this.cgpaA = cgpaA;
    }

    public double getCgpaV() {
        return cgpaV;
    }

    public void setCgpaV(double cgpaV) {
        this.cgpaV = cgpaV;
    }
}
