<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Charitap</title>
    <link rel="stylesheet" href="logincss.css">  </head>
<body>
    <div class="container">
        <h2>Welcome Back</h2>
        <p>Log in to continue making a difference.</p>
        <?php
        // Show messages (registered or errors) when present
        if (isset($_GET['registered'])) {
            echo '<div class="notice success">Registration successful. Please log in.</div>';
        }
        if (isset($_GET['error'])) {
            $err = (int)$_GET['error'];
            $msg = 'Login failed. Please check your credentials.';
            if ($err === 2) $msg = 'Server error connecting to database.';
            if ($err === 3) $msg = 'No account found with that email.';
            if ($err === 4) $msg = 'Incorrect password.';
            echo '<div class="notice error">' . htmlspecialchars($msg) . '</div>';
        }
        ?>
        <form id="loginForm" method="post" action="login_handler.php">
            <div class="input-group">
                <span class="icon envelope"></span>
                <input type="email" id="email" name="email" placeholder="Email" required>
                <div class="error" id="emailError">Please enter a valid email.</div>
            </div>
            <div class="input-group">
                <span class="icon lock"></span>
                <input type="password" id="password" name="password" placeholder="Password" required>
                <div class="error" id="passwordError">Password is required.</div>
            </div>
            <label><input type="checkbox"> Remember Me</label>
            <button type="submit">Login</button>
        </form>
        <div class="social-buttons">
            <button><span class="icon google"></span> Google</button>
            <button><span class="icon facebook"></span> Facebook</button>
        </div>
        <p><a href="#">Forgot Password?</a> | <a href="registration.php">Sign Up</a></p>
    </div>
    <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const emailError = document.getElementById('emailError');
            const passwordError = document.getElementById('passwordError');
            
            emailError.style.display = 'none';
            passwordError.style.display = 'none';
            
            if (!email.includes('@')) {
                emailError.style.display = 'block';
                return;
            }
            if (password.length < 6) {
                passwordError.style.display = 'block';
                return;
            }
            // Allow form to submit to login_handler.php
            this.submit();
        });
    </script>
</body>
</html>