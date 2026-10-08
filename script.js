// =========================================
// SUPABASE CONNECTION
// =========================================

const SUPABASE_URL = "https://cslowewwwtmxyxxexkhk.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_1VPycUBAxFakmD6SA4rVHA_25gSF8tb";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// =========================================
// TEST SUPABASE CONNECTION
// =========================================

async function testSupabaseConnection() {

    const { data, error } = await supabaseClient
        .from("students")
        .select("*");

    if (error) {

        console.error(
            "Supabase connection error:",
            error
        );

        return;
    }

    console.log(
        "Supabase connected successfully!",
        data
    );
}

testSupabaseConnection();


// =========================================
// TEACHER LOGIN
// =========================================

function openTeacherLogin() {

    const modal =
        document.getElementById("teacherLoginModal");

    if (modal) {

        modal.style.display = "flex";

    }
}


function closeTeacherLogin() {

    const modal =
        document.getElementById("teacherLoginModal");

    if (modal) {

        modal.style.display = "none";

    }
}


async function teacherLogin() {

    const email =
        document
            .getElementById("teacherEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("teacherPassword")
            .value;

    const message =
        document.getElementById("loginMessage");


    // Check fields

    if (!email || !password) {

        message.textContent =
            "Please enter your email and password.";

        return;
    }


    message.textContent =
        "Logging in...";


    console.log(
        "Attempting teacher login..."
    );


    // Supabase authentication

    const {
        data,
        error
    } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


    // Login failed

    if (error) {

        console.error(
            "SUPABASE LOGIN ERROR:",
            error
        );

        message.textContent =
            error.message;

        return;
    }


    // Login successful

    console.log(
        "Teacher logged in:",
        data.user
    );


    message.textContent =
        "Login successful! 🎉";


    // Open dashboard

    setTimeout(() => {

        closeTeacherLogin();

        openTeacherDashboard();

    }, 700);

}


// =========================================
// TEACHER DASHBOARD
// =========================================

function openTeacherDashboard() {

    const dashboard =
        document.getElementById(
            "teacherDashboard"
        );


    if (!dashboard) {

        console.error(
            "Teacher dashboard HTML was not found!"
        );

        return;
    }


    dashboard.style.display =
        "block";


    console.log(
        "Teacher dashboard opened successfully!"
    );


    // Load students

    loadStudents();

}


function closeTeacherDashboard() {

    const dashboard =
        document.getElementById(
            "teacherDashboard"
        );


    if (dashboard) {

        dashboard.style.display =
            "none";

    }
}


// =========================================
// ADD STUDENT MODAL
// =========================================

function openAddStudent() {

    const modal =
        document.getElementById(
            "addStudentModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }
}


function closeAddStudent() {

    const modal =
        document.getElementById(
            "addStudentModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }
}


// =========================================
// ADD STUDENT
// =========================================

async function addStudent() {

    const name =
        document
            .getElementById("newStudentName")
            .value
            .trim();


    const level =
        document
            .getElementById("studentLevel")
            .value;


    const message =
        document.getElementById(
            "addStudentMessage"
        );


    // Check student name

    if (!name) {

        message.textContent =
            "Please enter the student's name.";

        return;
    }


    message.textContent =
        "Saving student...";


    // Get logged-in teacher

    const {

        data: {
            user
        },

        error: userError

    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            "Teacher authentication error:",
            userError
        );

        message.textContent =
            "You must be logged in as a teacher.";

        return;
    }


    // Save student

    const {
        data,
        error
    } =
        await supabaseClient
            .from("students")
            .insert([

                {

                    name: name,

                    level: level,

                    teacher_id: user.id

                }

            ])
            .select();


    // Saving failed

    if (error) {

        console.error(
            "ADD STUDENT ERROR:",
            error
        );

        message.textContent =
            "Could not save the student.";

        return;
    }


    // Saving successful

    console.log(
        "Student added:",
        data
    );


    message.textContent =
        "Student added successfully! 🎉";


    // Clear name field

    document
        .getElementById("newStudentName")
        .value = "";


    // Refresh student list

    setTimeout(() => {

        closeAddStudent();

        loadStudents();

    }, 700);

}


// =========================================
// LOAD STUDENTS
// =========================================

async function loadStudents() {

    const studentList = document.getElementById("studentList");

    if (!studentList) {
        console.error("Student list was not found!");
        return;
    }

    studentList.innerHTML = `
        <p class="empty-students">
            Loading students... 🐱
        </p>
    `;

    // Get currently logged-in teacher
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {

        console.error("Teacher is not logged in.");

        studentList.innerHTML = `
            <p class="empty-students">
                Please log in again.
            </p>
        `;

        return;
    }

    // Get this teacher's students
    const { data, error } = await supabaseClient
        .from("students")
        .select("*")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {

        console.error("Error loading students:", error);

        studentList.innerHTML = `
            <p class="empty-students">
                Unable to load students.
            </p>
        `;

        return;
    }

    // No students yet
    if (!data || data.length === 0) {

        studentList.innerHTML = `
            <div class="empty-students">
                <div style="font-size: 40px;">🐱</div>
                <p>No students yet.</p>
                <p>Add your first student!</p>
            </div>
        `;

        return;
    }

    // Display students
    studentList.innerHTML = "";

    data.forEach(student => {

        const progress = student.progress || 0;

        const lesson =
            student.current_lesson ||
            "No lesson recorded yet";

        const score =
            student.last_score || 0;

        const notes =
            student.teacher_notes ||
            "No teacher notes yet.";

        const studentCard = document.createElement("div");

        studentCard.className = "student-card";

        studentCard.innerHTML = `

            <div class="student-card-top">

                <div class="student-avatar">
                    👩‍🎓
                </div>

                <div class="student-main-info">

                    <h3>
                        ${escapeHTML(student.name)}
                    </h3>

                    <span class="student-level">
                        ${escapeHTML(student.level || "Beginner")}
                    </span>

                </div>

            </div>

            <div class="student-progress-info">

                <div class="progress-row">

                    <span>📚 Current Lesson</span>

                    <strong>
                        ${escapeHTML(lesson)}
                    </strong>

                </div>

                <div class="progress-row">

                    <span>🌱 Progress</span>

                    <strong>
                        ${progress}%
                    </strong>

                </div>

                <div class="dashboard-progress-bar">

                    <div
                        class="dashboard-progress-fill"
                        style="width: ${progress}%"
                    ></div>

                </div>

                <div class="progress-row">

                    <span>📝 Last Score</span>

                    <strong>
                        ${score}
                    </strong>

                </div>

                <div class="teacher-note-display">

                    <span>💬 Teacher Notes</span>

                    <p>
                        ${escapeHTML(notes)}
                    </p>

                </div>

            </div>

            <button
                class="update-progress-button"
                onclick="openUpdateProgress('${student.id}')"
            >
                📈 Update Progress
            </button>

        `;

        studentList.appendChild(studentCard);

    });
}


// =========================================
// SECURITY HELPER
// =========================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


// =========================================
// MY ESL CAT SPACE
// MAIN JAVASCRIPT
// =========================================


// =========================================
// SMOOTH SCROLLING
// =========================================

function goToLearning() {

    const learning =
        document.getElementById(
            "learning"
        );


    if (learning) {

        learning.scrollIntoView({

            behavior: "smooth"

        });

    }

}


// =========================================
// STUDENT MODAL
// =========================================

function openStudentArea() {

    const modal =
        document.getElementById(
            "studentModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        "active"
    );


    setTimeout(() => {

        const input =
            document.getElementById(
                "welcomeStudentName"
            );


        if (input) {

            input.focus();

        }

    }, 300);

}


function closeStudentArea() {

    const modal =
        document.getElementById(
            "studentModal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

    }

}


// =========================================
// STUDENT WELCOME
// =========================================

function studentWelcome() {

    const name =
        document
            .getElementById(
                "welcomeStudentName"
            )
            .value
            .trim();


    const message =
        document.getElementById(
            "welcomeStudentMessage"
        );


    if (name === "") {

        message.textContent =
            "🐾 Please enter your name first!";

        return;
    }


    message.textContent =
        `Welcome, ${name}! 🌸 Your learning space will be ready soon.`;

}


// =========================================
// LEARNING CARDS
// =========================================

function openLesson(lesson) {

    // Hide the main learning section
    const learningSection = document.getElementById("learning");

    if (learningSection) {
        learningSection.style.display = "none";
    }


    // Hide all lesson detail sections
    const lessonSections = document.querySelectorAll(
        ".lesson-detail-section"
    );

    lessonSections.forEach(section => {
        section.style.display = "none";
    });


    // Decide which section to open
    let sectionId = "";


    if (lesson === "Vocabulary") {
        sectionId = "vocabularyLesson";
    }

    else if (lesson === "Grammar") {
        sectionId = "grammarLesson";
    }

    else if (lesson === "Speaking") {
        sectionId = "speakingLesson";
    }

    else if (lesson === "Reading") {
        sectionId = "readingLesson";
    }


    // Open the selected section
    const selectedSection =
        document.getElementById(sectionId);


    if (selectedSection) {

        selectedSection.style.display = "block";

        // Move the page to the beginning of the section
        selectedSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}

function backToLearning() {

    // Hide all detailed lesson sections
    const lessonSections = document.querySelectorAll(
        ".lesson-detail-section"
    );

    lessonSections.forEach(section => {
        section.style.display = "none";
    });


    // Show the main learning section
    const learningSection =
        document.getElementById("learning");


    if (learningSection) {

        learningSection.style.display = "block";

        learningSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


// =========================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// =========================================

window.addEventListener(
    "click",
    function(event) {


        const studentModal =
            document.getElementById(
                "studentModal"
            );


        const teacherModal =
            document.getElementById(
                "teacherLoginModal"
            );


        const addStudentModal =
            document.getElementById(
                "addStudentModal"
            );


        // Student modal

        if (
            event.target ===
            studentModal
        ) {

            closeStudentArea();

        }


        // Teacher login modal

        if (
            event.target ===
            teacherModal
        ) {

            closeTeacherLogin();

        }


        // Add student modal

        if (
            event.target ===
            addStudentModal
        ) {

            closeAddStudent();

        }

    }
);


// =========================================
// KEYBOARD ESCAPE
// =========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeStudentArea();

            closeTeacherLogin();

            closeAddStudent();

        }

    }
);


// =========================================
// PROGRESS DEMO
// =========================================

window.addEventListener(
    "load",
    function() {

        setTimeout(
            function() {

                const progress =
                    document.querySelector(
                        ".progress-fill"
                    );


                if (progress) {

                    progress.style.width =
                        "0%";

                }

            },
            500
        );

    }
);


// =========================================
// EXPRESSIVE ESL CAT
// =========================================

const walkingCat =
    document.querySelector(
        ".cat-walker"
    );


const catMessage =
    document.getElementById(
        "catMessage"
    );


const leftEye =
    document.querySelector(
        ".left-eye"
    );


const rightEye =
    document.querySelector(
        ".right-eye"
    );


// =========================================
// CAT MESSAGES
// =========================================

const catMessages = [

    "🐾Hi, Princesss!",

    "🌸 This website is for you only!",

    "🐾 Meow! Eat on Time!",

    "💗 Yay! You're here!",

    "🐱 Follow me!",

    "☁️ Take your time!",

     "🐾 I'm awake!",

    "🌷 Avoid from stress!"


];


// =========================================
// CHANGE CAT MESSAGE
// =========================================

function changeCatMessage(message) {

    if (!catMessage) {

        return;

    }


    catMessage.style.opacity =
        "0";


    setTimeout(() => {

        catMessage.textContent =
            message;


        catMessage.style.opacity =
            "1";

    }, 250);

}


// =========================================
// RANDOM CAT ACTION
// =========================================

function randomCatAction() {

    if (!walkingCat) {

        return;

    }


    walkingCat.classList.remove(

        "jumping",

        "sleeping",

        "waving",

        "happy"

    );


    const random =
        Math.floor(
            Math.random() * 4
        );


    if (random === 0) {


        // JUMP

        changeCatMessage(
            "🌷 Avoid from stress!"
        );


        walkingCat.classList.add(
            "jumping"
        );


        setTimeout(() => {

            walkingCat.classList.remove(
                "jumping"
            );

        }, 1000);


    }


    else if (random === 1) {


        // WAVE

        changeCatMessage(
            "🌸 This website is for you only!"
        );


        walkingCat.classList.add(
            "waving"
        );


        setTimeout(() => {

            walkingCat.classList.remove(
                "waving"
            );

        }, 2500);


    }


    else if (random === 2) {


        // HAPPY

        changeCatMessage(
            "💗 Yay! You're here!"
        );


        walkingCat.classList.add(
            "happy"
        );


        setTimeout(() => {

            walkingCat.classList.remove(
                "happy"
            );

        }, 1000);


    }


    else {


        // SLEEP

        changeCatMessage(
            "😴 Zzz... learning is tiring!"
        );


        walkingCat.classList.add(
            "sleeping"
        );


        setTimeout(() => {

            walkingCat.classList.remove(
                "sleeping"
            );


            changeCatMessage(
                "🐾 I'm awake!"
            );

        }, 4000);

    }

}


// =========================================
// RANDOM ACTION EVERY 8 SECONDS
// =========================================

setInterval(
    randomCatAction,
    8000
);


// =========================================
// MOUSE FOLLOWING EYES
// =========================================

document.addEventListener(
    "mousemove",
    function(event) {


        if (
            !leftEye ||
            !rightEye
        ) {

            return;

        }


        const eyePositions = [

            leftEye,

            rightEye

        ];


        eyePositions.forEach(
            function(eye) {


                const rect =
                    eye.getBoundingClientRect();


                const eyeX =
                    rect.left +
                    rect.width / 2;


                const eyeY =
                    rect.top +
                    rect.height / 2;


                const angle =
                    Math.atan2(

                        event.clientY - eyeY,

                        event.clientX - eyeX

                    );


                const distance =
                    4;


                const moveX =
                    Math.cos(angle) *
                    distance;


                const moveY =
                    Math.sin(angle) *
                    distance;


                eye.style.transform =
                    `translate(${moveX}px, ${moveY}px)`;

            }
        );

    }
);


// =========================================
// CLICK THE CAT
// =========================================

if (walkingCat) {

    walkingCat.addEventListener(
        "click",
        function() {


            walkingCat.classList.remove(
                "clicked"
            );


            // Force animation restart

            void walkingCat.offsetWidth;


            walkingCat.classList.add(
                "clicked"
            );


            changeCatMessage(
                "💗 Meow! Eat on Time!"
            );


            setTimeout(() => {

                walkingCat.classList.remove(
                    "clicked"
                );

            }, 800);

        }
    );

}


// =========================================
// INITIAL CAT MESSAGE
// =========================================

setTimeout(() => {

    changeCatMessage(
        "🐾 Hi, Princesss!"
    );

}, 1000);

// ==========================================
// UPDATE STUDENT PROGRESS
// ==========================================

let selectedStudentId = null;


// Open Update Progress modal
async function openUpdateProgress(studentId) {

    selectedStudentId = studentId;

    const modal =
        document.getElementById("updateProgressModal");

    const studentName =
        document.getElementById("progressStudentName");

    const lessonInput =
        document.getElementById("progressLesson");

    const progressInput =
        document.getElementById("progressValue");

    const scoreInput =
        document.getElementById("progressScore");

    const notesInput =
        document.getElementById("progressNotes");

    const progressNumber =
        document.getElementById("progressNumber");

    const message =
        document.getElementById("progressMessage");


    if (!modal) {
        console.error("Update Progress modal was not found!");
        return;
    }


    // Reset message
    message.textContent = "";


    // Get student information
    const { data: student, error } = await supabaseClient
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();


    if (error) {

        console.error(
            "Error loading student:",
            error
        );

        message.textContent =
            "Unable to load student information.";

        return;
    }


    // Put existing information into the form
    studentName.textContent =
        `Updating: ${student.name}`;


    lessonInput.value =
        student.current_lesson || "";


    progressInput.value =
        student.progress || 0;


    progressNumber.textContent =
        `${student.progress || 0}%`;


    scoreInput.value =
        student.last_score || "";


    notesInput.value =
        student.teacher_notes || "";


    // Show modal
    modal.style.display = "flex";
}


// Close Update Progress modal
function closeUpdateProgress() {

    const modal =
        document.getElementById("updateProgressModal");

    if (modal) {
        modal.style.display = "none";
    }

    selectedStudentId = null;
}


// Update percentage text
function updateProgressNumber() {

    const progress =
        document.getElementById("progressValue").value;

    document.getElementById(
        "progressNumber"
    ).textContent = `${progress}%`;
}


// Save student progress
async function saveStudentProgress() {

    if (!selectedStudentId) {

        console.error(
            "No student has been selected."
        );

        return;
    }


    const lesson =
        document
            .getElementById("progressLesson")
            .value
            .trim();


    const progress =
        Number(
            document
                .getElementById("progressValue")
                .value
        );


    const scoreInput =
        document
            .getElementById("progressScore")
            .value;


    const score =
        scoreInput === ""
            ? 0
            : Number(scoreInput);


    const notes =
        document
            .getElementById("progressNotes")
            .value
            .trim();


    const message =
        document.getElementById(
            "progressMessage"
        );


    // Validate progress
    if (progress < 0 || progress > 100) {

        message.textContent =
            "Progress must be between 0% and 100%.";

        return;
    }


    // Validate score
    if (score < 0 || score > 100) {

        message.textContent =
            "Score must be between 0 and 100.";

        return;
    }


    message.textContent =
        "Saving progress... 🐱";


    // Update Supabase
    const { data, error } =
        await supabaseClient
            .from("students")
            .update({

                current_lesson: lesson,

                progress: progress,

                last_score: score,

                teacher_notes: notes,

                updated_at: new Date().toISOString()

            })
            .eq("id", selectedStudentId)
            .select();


    if (error) {

        console.error(
            "Error updating progress:",
            error
        );

        message.textContent =
            "Could not save progress. Please try again.";

        return;
    }


    console.log(
        "Student progress updated:",
        data
    );


    message.textContent =
        "Progress saved successfully! 🎉";


    // Refresh student list
    await loadStudents();


    // Close modal shortly after saving
    setTimeout(() => {

        closeUpdateProgress();

    }, 900);
}

