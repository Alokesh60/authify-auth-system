const sendOtpBtn = document.getElementById("sendOtpBtn");
const otpContainer = document.getElementById("otp-container");
const otpStatus = document.getElementById("otp-status");
const otpInputs = document.querySelectorAll(".otp-input");
const otpFinalInput = document.getElementById("otpFinal");

//password matching
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

//password strength
const strength = document.getElementById("passwordStrength");
const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  if (password.value.length < 7) {
    e.preventDefault();
    strength.innerText = "Password must be at least 7 characters.";
    strength.style.color = "red";
    password.classList.add("is-invalid");
  }
});

password.addEventListener("input", () => {
  const val = password.value;
  let level = 0;

  if (/[a-z]/.test(val)) level++;
  if (/[A-Z]/.test(val)) level++;
  if (/[0-9]/.test(val)) level++;
  if (/[\W_]/.test(val)) level++;

  if (val.length < 7) {
    strength.innerText = "Password must be at least 7 characters";
    strength.style.color = "red";
    return;
  }

  //level
  if (level === 1) {
    strength.innerText = "Weak password";
  } else if (level === 2 || level === 3) {
    strength.innerText = "Moderate password";
  } else {
    strength.innerText = "Strong password";
  }
});

function validatePasswords() {
  if (!confirmPassword.value) {
    confirmPassword.classList.remove("is-valid", "is-invalid");
    return;
  }

  if (password.value === confirmPassword.value) {
    confirmPassword.classList.add("is-valid");
    confirmPassword.classList.remove("is-invalid");
  } else {
    confirmPassword.classList.add("is-invalid");
    confirmPassword.classList.remove("is-valid");
  }
}

password.addEventListener("input", validatePasswords);
confirmPassword.addEventListener("input", validatePasswords);

//OTP button
sendOtpBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  if (!email) {
    otpStatus.innerText = "Please enter your email first.";
    otpStatus.classList.remove("text-success");
    otpStatus.classList.add("text-danger");
    return;
  }

  try {
    const response = await fetch("/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (result.success) {
      otpStatus.innerText = "OTP sent successfully!";
      otpStatus.classList.remove("text-danger");
      otpStatus.classList.add("text-success");
      otpContainer.classList.remove("d-none");

      otpInputs.forEach((input) => (input.value = ""));
      otpInputs[0].focus();
    } else {
      otpStatus.innerText = "Failed to send OTP.";
      otpStatus.classList.remove("text-success");
      otpStatus.classList.add("text-danger");
    }
  } catch (err) {
    otpStatus.innerText = "Error sending OTP.";
    otpStatus.classList.remove("text-success");
    otpStatus.classList.add("text-danger");
  }
});

otpInputs.forEach((input, idx) => {
  input.addEventListener("input", () => {
    if (input.value.length === 1 && idx < otpInputs.length - 1) {
      otpInputs[idx + 1].focus();
    }

    otpFinalInput.value = Array.from(otpInputs)
      .map((el) => el.value)
      .join("");
  });

  //allow numbers only
  input.addEventListener("keydown", (e) => {
    if (
      !e.key.match(/[0-9]/) &&
      e.key !== "Backspace" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight"
    ) {
      e.preventDefault();
    }
  });
});
