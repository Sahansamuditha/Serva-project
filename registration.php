<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Charitap</title>
    <link rel="stylesheet" href="registercss.css">  </head>
<body>
    <div class="container">
        <h2>Join Charitap</h2>
        <div class="progress"><div class="progress-bar"></div></div>
        <p>Step 1: Create your account.</p>
        <!-- Registration form: collects user details and submits to register.php -->
        <form id="registerForm" method="post" action="register.php">
            <div class="input-group">
                <span class="icon user"></span>
                <input type="text" id="name" name="name" placeholder="Full Name" required>
                <div class="error" id="nameError">Name is required.</div>
            </div>
            <div class="input-group">
                <span class="icon envelope"></span>
                <input type="email" id="email" name="email" placeholder="Email" required>
                <div class="error" id="emailError">Please enter a valid email.</div>
            </div>
            <div class="input-group">
                <span class="icon lock"></span>
                <input type="password" id="password" name="password" placeholder="Password" required>
                <div class="error" id="passwordError">Password must be at least 6 characters.</div>
            </div>
            <div class="input-group">
                <span class="icon lock"></span>
                <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" required>
                <div class="error" id="confirmError">Passwords do not match.</div>
            </div>
            <div class="input-group">
                <span class="icon users"></span>
                <select id="userType" name="userType" required>
                    <option value="">Select User Type</option>
                    <option value="donor">Donor</option>
                    <option value="recipient">Recipient</option>
                </select>
                <div class="error" id="typeError">Please select a user type.</div>
            </div>
            <label><input type="checkbox" id="terms" name="terms" required> I agree to the <a href="#">Terms & Conditions</a></label>
            <div class="error" id="termsError">You must agree to the terms.</div>
            <button type="submit">Register</button>
        </form>
        <!-- Social login buttons (Google, Facebook) - not implemented in PHP -->
        <div class="social-buttons">
            <button><span class="icon google"></span> Google</button>
            <button><span class="icon facebook"></span> Facebook</button>
        </div>
        <!-- Link to login page for existing users -->
        <p>Already have an account? <a href="login.php">Login</a></p>
    </div>
    <script>
        // Client-side validation for registration form (PHP does server-side validation)
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            // Keep client-side validation but let PHP handle submission
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const userType = document.getElementById('userType').value;
            const terms = document.getElementById('terms').checked;
            
            // Hide all errors
            document.querySelectorAll('.error').forEach(el => el.style.display = 'none');
            
            if (!name) {
                document.getElementById('nameError').style.display = 'block';
                e.preventDefault();
                return;
            }
            if (!email.includes('@')) {
                document.getElementById('emailError').style.display = 'block';
                e.preventDefault();
                return;
            }
            if (password.length < 6) {
                document.getElementById('passwordError').style.display = 'block';
                e.preventDefault();
                return;
            }
            if (password !== confirmPassword) {
                document.getElementById('confirmError').style.display = 'block';
                e.preventDefault();
                return;
            }
            if (!userType) {
                document.getElementById('typeError').style.display = 'block';
                e.preventDefault();
                return;
            }
            if (!terms) {
                document.getElementById('termsError').style.display = 'block';
                e.preventDefault();
                return;
            }
            // allow form to submit to register.php
        });
    </script>
</body>
</html>
