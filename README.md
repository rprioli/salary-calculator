# Skywage - Cabin Crew Salary Calculator

A modern, interactive web application that calculates salary for cabin crew members based on their monthly roster data. The calculator processes CSV flight roster files to determine fixed and variable salary components, with a clean, minimalist user interface.

## Features

- Select cabin crew role (CCM or SCCM)
- Upload roster CSV file
- Calculate salary components:
  - Basic salary
  - Housing allowance
  - Transportation allowance
  - Flight duty pay
  - Per diem for layovers
  - Airport standby pay
- View detailed flight information
- Edit debriefing times
- Delete flights (with confirmation)
- Automatic layover detection and per diem calculation

## Project Structure

```
Skywage/
│
├── index.html           # Main HTML file
├── css/
│   └── styles.css       # Custom CSS styles
│
├── js/
│   ├── main.js          # Main application logic
│   ├── constants.js     # Salary data and constants
│   ├── utils.js         # Utility functions
│   ├── dataProcessing.js # Data processing functions
│   │
│   └── components/      # UI Components
│       ├── flightDetailsTable.js
│       ├── monthlySummary.js
│       ├── salaryBreakdown.js
│       └── deleteConfirmation.js
│
└── README.md            # Project documentation
```

## How to Use

1. Open `sign-in.html` in a web browser
2. Sign in with your account or register a new account
3. Your role (CCM or SCCM) is set during registration and can be changed in your profile
4. Upload your roster CSV file or add flights manually
5. View your calculated salary breakdown and flight details
6. Optionally edit debriefing times or delete flights

## CSV Format

The application expects a CSV file with roster data in the following format:

- Contains a section header 'Schedule Details' or column headers with 'Date', 'Duties', 'Details'
- Date format should be 'DD/MM/YYYY'
- Flight duties are identified by 'FZ' in the duties column
- Airport standby duties are identified by 'ASBY' in the duties column

## Development

This project uses:

- Vanilla JavaScript (ES6+)
- Tailwind CSS for styling
- Papa Parse for CSV parsing

## Salary Calculation Rules

- Fixed components (based on role):

  - Basic salary
  - Housing allowance
  - Transportation allowance

- Variable components:
  - Flight pay: (Flight duty period - 30min) × hourly rate
  - Per diem: Layover hours × per diem rate
  - Airport standby pay: Standby hours × standby rate
