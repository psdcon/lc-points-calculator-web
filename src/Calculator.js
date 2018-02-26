import React from "react";
import Select from "react-select-plus";

import subjectOptions from './subjects.json';
// Styles
// import "./bootstrap-v6a4.css";
// import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/react-select-plus/dist/react-select-plus.css';
import "./Calculator.css";

let LCVPOptions = [
    {"label": "Pass", "value": "Pass", "index": 0},
    {"label": "Merit", "value": "Merit", "index": 1},
    {"label": "Distinction", "value": "Distinction", "index": 2}
];


// Helper Functions
// Disables already-selected options
function setOptionDisabled(optionLabel, state) {
    subjectOptions.forEach(function (option) {
        // Handle English Irish Maths outside opgroup
        if (option.label === optionLabel) {
            option.disabled = state;
            return
        }
        // Handle subjects inside opgroup
        else if (option.hasOwnProperty('options')) {
            option.options.forEach(function (op) {
                if (op.label === optionLabel) {
                    op.disabled = state;
                    return
                }
            })
        }
    })
}

// Fuzzy Search for filtering options
function fuzzyFilterOptions(options, filterValue, excludeOptions, props) {
    filterValue = filterValue.toUpperCase();

    return options.filter(function (option) {
        if (!filterValue) return true;

        option = option.label.toUpperCase();

        let j = -1; // remembers position of last found character

        // consider each filterValue character one at a time
        for (let i = 0; i < filterValue.length; i++) {
            const l = filterValue[i];
            if (l === ' ') continue;     // ignore spaces

            j = option.indexOf(l, j + 1);     // search for character & update position
            if (j === -1) return false;  // if it's not found, exclude this item
        }
        return true;
    })
}

// React Components
// Shape Button
const LevelToggle = ({levelName, levelIndex, onClick}) => (
    (levelIndex === 0) ?
        <div className="btn-group level-toggle-btns" role="group" aria-label="Basic example">
            <button type="button" className="btn btn-primary">H</button>
            <button type="button" className="btn btn-outline-primary" onClick={() => onClick(1)}>O</button>
        </div>
        :
        <div className="btn-group level-toggle-btns" role="group" aria-label="Basic example">
            <button type="button" className="btn btn-outline-primary" onClick={() => onClick(0)}>H</button>
            <button type="button" className="btn btn-primary">O</button>
        </div>
);


// Tariff Value Text
const GradeInput = ({grade, onChange}) => (
    <input type="number" className="form-control grade-input" onChange={onChange} value={grade} min="1" max="8"></input>
);

// Tariff Value Text
const PointsOutput = ({points, wasCounted}) => (
    (wasCounted) ?
        <div className="points">{points}</div>
        :
        <div className="points points__not-counted" title="Not counted in highest 6">{points}</div>
);

// Calculator row
const Row = ({options, onSubjectChange, onLevelChange, onGradeChange, selectLabelValue, levelName, levelIndex, grade, points, wasCounted}) => (
    <div className="calculator-row">
        <Select value={selectLabelValue} options={options} onChange={onSubjectChange} filterOptions={fuzzyFilterOptions}/>
        <LevelToggle levelName={levelName} levelIndex={levelIndex} onClick={onLevelChange}/>
        <GradeInput grade={grade} onChange={onGradeChange}/>
        <PointsOutput points={points} wasCounted={wasCounted}/>
    </div>
);

const LCVPRow = ({LCVPSelectedLabel, onLCVPChange, points, wasCounted}) => (
    <div className="calculator-row">
        <span className="lcvp-label">LCVP</span>
        <Select className="lcvp-select" value={LCVPSelectedLabel} options={LCVPOptions} onChange={onLCVPChange} filterOptions={fuzzyFilterOptions}/>
        <PointsOutput points={points} wasCounted={wasCounted}/>
    </div>
);

// Grades
let pointsArray = [
    // Higher
    [100, 88, 77, 66, 56, 46, 37, 0],
    // Lower
    [56, 46, 37, 28, 20, 12, 0, 0]
];
let LCVPPointsArray = [28, 46, 66];

class Calculator extends React.Component {
    numSubjects = 6;

    constructor() {
        super();

        let subjects = new Array(this.numSubjects).fill(null);
        subjects[0] = "English";
        subjects[1] = "Irish";
        subjects[2] = "Maths";

        this.state = {
            subjects: subjects,
            levels: new Array(this.numSubjects).fill(0),
            grades: new Array(this.numSubjects).fill(""),
            // LCVP
            LCVPRowIndex: null,
            LCVPSelectedIndex: null,
            LCVPSelectedLabel: null
        };

    }

    // onChange handler for react-selects
    handleSubjectChange(i, data) {
        let subjects = this.state.subjects.slice();
        let grade = this.state.grades.slice();

        if (data === null) {
            setOptionDisabled(subjects[i], false);
            subjects[i] = null;
            grade[i] = "";
        } else {
            subjects[i] = data.value;
            setOptionDisabled(subjects[i], true);
        }

        this.setState({
            subjects: subjects,
            grades: grade,
        });
    }

    handleLevelChange(i, levelIndex) {
        let level = this.state.levels.slice();
        level[i] = levelIndex;

        this.setState({
            levels: level,
        });
    }

    handleGradeChange(i, event) {
        let grades = this.state.grades.slice();
        grades[i] = parseInt(event.target.value, 10);

        // Check for valid input
        if (isNaN(grades[i]) || grades[i] < 1 || grades[i] > 8){
            window.alert("Only numbers 1 to 8 are allowed");
            grades[i] = ""
        }

        this.setState({
            grades: grades,
        });
    }

    handleAddRowClick() {
        if (this.numSubjects >= 20) {
            window.alert("Alright Einstein, that's enough");
            return
        }

        let subjects = this.state.subjects.slice();
        let levels = this.state.levels.slice();
        let grades = this.state.grades.slice();

        subjects.push(null);
        levels.push(0);
        grades.push("");

        this.numSubjects += 1;

        this.setState({
            subjects: subjects,
            levels: levels,
            grades: grades
        });
    }

    handleAddLCVPClick() {
        if (this.state.LCVPRowIndex === null) {

            let subjects = this.state.subjects.slice();
            let levels = this.state.levels.slice();
            let grades = this.state.grades.slice();

            subjects.push(null);
            levels.push(0);
            grades.push("");

            this.numSubjects += 1;

            this.setState({
                subjects: subjects,
                levels: levels,
                grades: grades,

                LCVPRowIndex: this.numSubjects - 1
            })
        }
        else {
            window.alert("LCVP is already added")
        }
    }

    handleLCVPChange(data) {
        if (data !== null) {
            this.setState({
                LCVPSelectedIndex: data.index,
                LCVPSelectedLabel: data.label
            });
        }
        else {
            this.setState({
                LCVPSelectedIndex: null,
                LCVPSelectedLabel: null
            });
        }
        // let LCVPSelectedIndex = (data === null) ? null : ;
    }

    pointsSortFunc(a, b) {
        if (a["points"] === b["points"]) {
            return 0;
        }
        else {
            return (a["points"] > b["points"]) ? -1 : 1;
        }
    }

    render() {
        // Calculate array of points
        // Need a specific loop for 'maths'
        let pointsToSort = new Array(this.numSubjects);
        let points = new Array(this.numSubjects).fill(0);
        for (let i = 0; i < this.numSubjects; i++) {
            const subject = this.state.subjects[i];
            const level = this.state.levels[i];
            const grade = this.state.grades[i];

            if (!isNaN(parseInt(grade, 10))) {
                points[i] = pointsArray[level][grade - 1];
                if (subject === "Maths" && level === 0 && grade <= 6) {
                    points[i] += 25;
                }
            }
            else if (i === this.state.LCVPRowIndex && this.state.LCVPSelectedIndex !== null) {
                points[i] = LCVPPointsArray[this.state.LCVPSelectedIndex]
            }
            pointsToSort[i] = {
                "points": points[i],
                "index": i
            };
        }
        // Sort based on points
        pointsToSort.sort(this.pointsSortFunc);
        // Make array of bools for counted
        // Also add points of top 6
        let wasCounted = new Array(this.numSubjects).fill(false);
        let totalPoints = 0;
        for (let i = 0; i < 6; i++) {
            let index = pointsToSort[i]["index"];
            wasCounted[index] = true;
            // Add points
            totalPoints += pointsToSort[i]["points"];
        }

        let rows = [];
        for (let i = 0; i < this.numSubjects; i++) {
            if (i === this.state.LCVPRowIndex) {
                rows.push(
                    <LCVPRow key={i}
                             LCVPSelectedLabel={this.state.LCVPSelectedLabel}
                             onLCVPChange={(data) => this.handleLCVPChange(data)}
                             points={points[i]}
                             wasCounted={wasCounted[i]}
                    />
                )
            }
            else {
                let filteredOps = JSON.parse(JSON.stringify(subjectOptions)); // force change by duplicating object

                const levelName = `level-radio-${i}`;

                rows.push(
                    <Row key={i}
                         options={filteredOps}
                         onSubjectChange={(data) => this.handleSubjectChange(i, data)}
                         onLevelChange={(levelIndex) => this.handleLevelChange(i, levelIndex)}
                         onGradeChange={(event) => this.handleGradeChange(i, event)}
                         selectLabelValue={this.state.subjects[i]}
                         levelName={levelName}
                         levelIndex={this.state.levels[i]}
                         grade={this.state.grades[i]}
                         points={points[i]}
                         wasCounted={wasCounted[i]}
                    />)
            }
        }

        return (
            <div className="calculator">
                <div className="calculator__main">
                    <button type="button" className="btn btn-outline-success btn-sm about-btn" data-toggle="modal" data-target="#aboutModal">About</button>

                    <h4 className="total-points">
                        <small>Total Points:&nbsp;</small>
                        {totalPoints}
                    </h4>

                    {rows}

                    <div className="action-btns">
                        <button type="button" className="btn btn-outline-primary" onClick={() => this.handleAddRowClick()}>Add Subject</button>
                        <button type="button" className="btn btn-outline-primary" onClick={() => this.handleAddLCVPClick()}>Add LCVP</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default Calculator;
