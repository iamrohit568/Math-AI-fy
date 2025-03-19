📌 About the Project

This project is an AI-powered web-based math solver that allows users to write or draw mathematical equations naturally on a digital canvas. Unlike traditional typed-input math tools, our solution leverages handwriting recognition technology to interpret equations accurately and provide instant feedback and solutions.



🚀 Features

🖊 Handwritten Math Input – Write equations naturally on the screen.

🤖 AI-Powered Recognition – Converts handwritten equations into digital format.

⚡ Instant Feedback & Solutions – Provides real-time step-by-step solutions.

🔣 Supports Various Math Notations – Handles algebra, calculus, trigonometry, and more.

🌐 Web-Based & User-Friendly – No software installation required.



🛠 Tech Stack

Frontend: React.js / HTML / CSS

Backend: Node.js / Express

AI Model: TensorFlow / OpenCV / Custom Handwriting Recognition




## Project Setup Instructions

Follow these steps to set up the project after cloning:

### Backend Setup

1. Navigate to the backend directory:
   ```sh
   cd calc-be
   ```
2. Create a virtual environment:
   ```sh
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```sh
     venv\Scripts\Activate.ps1
     ```
   - **Mac/Linux**:
     ```sh
     source venv/bin/activate
     ```
4. Install the required packages:
   ```sh
   pip install -r requirements.txt
   ```
5. Create a Gemini API key and paste it into a `.env` file as shown in the video.
6. Create a `.env.local` file and paste the necessary link shown in the video.
7. Run the backend:
   ```sh
   python main.py
   ```
   - If you encounter errors, try:
     ```sh
     python3 main.py
     ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```sh
   cd calc-fe
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend:
   ```sh
   npm run dev
   ```
4. Hold `Ctrl` and click on the provided link to open the project.

---

Feel free to update this `README.md` with any additional setup instructions or project details. 🚀



📌 Contributing
Contributions are welcome! Feel free to fork this repository and submit a pull request with your improvements.

📄 License
This project is licensed under the MIT License.

