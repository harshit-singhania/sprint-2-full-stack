import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class HashGen {
    public static void main(String[] args) {
        BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
        String[] passwords = {"Admin@123", "User@123"};
        for (String p : passwords) {
            System.out.println(p + " => " + enc.encode(p));
        }
    }
}
