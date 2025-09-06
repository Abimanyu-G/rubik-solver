import React, { useState, useCallback } from 'react';
import { useEffect } from 'react';
import Cube from 'cubejs';  
/* Rubik's Cube Solver Styles */
import './RubiksCubeSolver.css';
import './solve.css'; // Additional styles

const RubiksCubeSolver = () => {
  // Cube state - each face has 9 stickers
  const [cubeState, setCubeState] = useState({
    U: Array(9).fill('W'), // Up (White)
    R: Array(9).fill('R'), // Right (Red)
    F: Array(9).fill('G'), // Front (Green)
    D: Array(9).fill('Y'), // Down (Yellow)
    L: Array(9).fill('O'), // Left (Orange)
    B: Array(9).fill('B'), // Back (Blue)
  });

  const [selectedColor, setSelectedColor] = useState('W');
  const [solution, setSolution] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

    useEffect(() => {
    Cube.initSolver();
    console.log("Cube solver initialized");
  }, []);

  // Color mappings
  const colors = {
    W: { name: 'White', className: 'color-white' },
    R: { name: 'Red', className: 'color-red' },
    G: { name: 'Green', className: 'color-green' },
    Y: { name: 'Yellow', className: 'color-yellow' },
    O: { name: 'Orange', className: 'color-orange' },
    B: { name: 'Blue', className: 'color-blue' },
  };

  // Update a specific sticker on a face
  const updateSticker = useCallback((face, index) => {
    setCubeState(prev => ({
      ...prev,
      [face]: prev[face].map((color, i) => i === index ? selectedColor : color)
    }));
  }, [selectedColor]);

  // Enhanced validation
  const validateCube = () => {
    try {
      const colorCount = {};
      Object.values(cubeState).forEach(face => {
        face.forEach(color => {
          colorCount[color] = (colorCount[color] || 0) + 1;
        });
      });

      const expectedColors = Object.keys(colors);
      for (const color of expectedColors) {
        if (colorCount[color] !== 9) {
          console.warn(`Color ${color} appears ${colorCount[color]} times, expected 9`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  // Convert cube state to string format (URFDLB order, cubejs expects this)
  const cubeToString = () => {
    const colorMap = {
      W: 'U', // White -> Up
      R: 'R', // Red -> Right  
      G: 'F', // Green -> Front
      Y: 'D', // Yellow -> Down
      O: 'L', // Orange -> Left
      B: 'B'  // Blue -> Back
    };
    
    const faceOrder = ['U', 'R', 'F', 'D', 'L', 'B'];
    return faceOrder.map(face => 
      cubeState[face].map(color => colorMap[color]).join('')
    ).join('');
};
  
    // Scramble cube using cubejs
const scrambleCube = () => {
  console.log("Scramble button clicked");
  try {
    const cube = new Cube(); // start from solved
    cube.randomize();        // apply random scramble

    // Convert scrambled cube back into sticker colors for UI
    const cubeString = cube.asString(); // e.g. "UUUUUUUUURRR..."
    const stringToColor = { U: 'W', R: 'R', F: 'G', D: 'Y', L: 'O', B: 'B' };

    const faceOrder = ['U', 'R', 'F', 'D', 'L', 'B'];
    let newState = {};

    let index = 0;
    for (let face of faceOrder) {
      newState[face] = cubeString
        .slice(index, index + 9)
        .split('')
        .map(ch => stringToColor[ch] || 'W');
      index += 9;
    }
    
    faceOrder.forEach(face => {
      if (!newState[face] || newState[face].length !== 9) {
        newState[face] = Array(9).fill('W'); 
      }
    });

    setCubeState(newState);
    setSolution(null);
    setError(null);
  } catch (err) {
    console.error("Scramble error:", err);
    setError("Failed to scramble cube.");
  }
};

  // Reset to solved state
const resetCube = () => {
  console.log("Reset button clicked");
  setCubeState({
    U: Array(9).fill('W'), // Up face
    R: Array(9).fill('R'), // Right face
    F: Array(9).fill('G'), // Front face
    D: Array(9).fill('Y'), // Down face
    L: Array(9).fill('O'), // Left face
    B: Array(9).fill('B'), // Back face
  });
  setSolution(null);
  setError(null);

  // Debug: check the cube string after reset
  
};

useEffect(() => {
    console.log("cubeToString reset:", cubeToString());
  }, [cubeState]);

  // Solve the cube
  const solveCube = async () => {
    setIsLoading(true);
    setError(null);
    setSolution(null);

    try {
      if (!validateCube()) {
        throw new Error("Cube is Broken! Each color must appear exactly 9 times.");
      }

      const cubeString = cubeToString();
      console.log('Cube string:', cubeString);

      const cube = Cube.fromString(cubeString);

      

      if (cube.isSolved()) {
        setSolution({
          moves: "Bruh It's already solved! 🐱‍🐉",
          steps: [],
          totalMoves: 0,
        });
        return;
      }

      // ✅ Get real solution
      const solutionMoves = cube.solve(); // returns a string like "R U R' U' ..."

      const movesArray = solutionMoves.trim().split(/\s+/);

      setSolution({
        moves: solutionMoves,
        steps: movesArray,
        totalMoves: movesArray.length,
      });

    } catch (err) {
      console.error('Solve error:', err);
      setError(err.message || "An unexpected error occurred while solving the cube.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if cube is in solved state
  const isCubeSolved = () => {
    const solvedState = {
      U: Array(9).fill('W'),
      R: Array(9).fill('R'), 
      F: Array(9).fill('G'),
      D: Array(9).fill('Y'),
      L: Array(9).fill('O'),
      B: Array(9).fill('B')
    };
    
    return Object.keys(cubeState).every(face =>
      cubeState[face].every((color, index) => 
        color === solvedState[face][index]
      )
    );
  };
  
  const getFaceLabel = (faceKey) => {
  switch (faceKey) {
    case "U": return "TOP";
    case "L": return "LEFT";
    case "F": return "FRONT";
    case "R": return "RIGHT";
    case "B": return "BACK";
    case "D": return "DOWN";
    default: return "";
  }
};

  // Render a single face
  const renderFace = (faceName, faceColors) => {
    const faceLabels = {
      U:'',
      R: '',
      F: '',
      D: '',
      L: '',
      B: '',
    };

    return (
      <div key={faceName} className="face-grid">
      <div className="face-label">
        {faceLabels[faceName]}
      </div>
      <div className="sticker-grid">
        {faceColors.map((color, index) => (
        <div
          key={`${faceName}-${index}`}
          className={`sticker ${colors[color].className} ${index === 4 ? 'sticker-center' : ''}`}
          onClick={() => updateSticker(faceName, index)}
          title={`${faceName}${index}: ${colors[color].name}`}
        >
          {index === 4 ? (
          <span className="face-center-label">{getFaceLabel(faceName)}</span>
          ) : ""}
          {/* {color} */}
        </div>
        ))}
      </div>
      </div>
    );
  };

  return (
    // <div className="cube-solver-container">
      <div className="main-wrapper">
        {/* Header */}
        <div className="header">
          <h1 className='heading-text'>Rubik<span style={{fontFamily:"monospace"}}>'</span>s  Cube  Solver</h1>
          <p>Easy Cube! <a href='https://www.linkedin.com/in/abimanyu-gjohn/' className='follow'>Follow me</a></p>
          {/* {isCubeSolved() && (
            <div style={{marginTop: '10px', fontSize: '1.2em'}}>
              ✅ Cube is in solved state!
            </div>
          )} */}
        </div>

        <div className="main-grid">
          {/* Input Section */}
          <div className="input-section">
            {/* <h2 className="section-title">Cube Configuration</h2> */}
            
            

            {/* Control Buttons */}
            <div className="control-buttons">
              <button
                onClick={scrambleCube}
                // className="control-button scramble-btn"
                className ="noir-btn noir-btn-default"
                title="Generate a random scrambled configuration"
              >Scramble</button>


              <button
                onClick={resetCube}
                // className="control-button reset-btn"
                className='noir-btnn noir-btn-default'
                title="Reset to solved state"
              >Reset
              </button>


            </div>

            {/* Cube Faces */}
            <div className="cube-net">
             <div className="cube-face top">
              {renderFace('U', cubeState.U)}
            </div>

             <div className="cube-face left">
                  {renderFace('L', cubeState.L)}
              </div>
              
              <div className="cube-face front">
               {renderFace('F', cubeState.F)}
              </div>
  
              <div className="cube-face right">
               {renderFace('R', cubeState.R)}
                </div>

             <div className="cube-face back">
              {renderFace('B', cubeState.B)}
             </div>
  
             <div className="cube-face bottom">
               {renderFace('D', cubeState.D)}
                </div>
                </div>

             {/* Color Palette */}
             <div className="color-palette-wrapper">
              <p className="color-palette-label">Select Color:</p>
              <div className="color-palette">
                {Object.entries(colors).map(([colorKey, colorData]) => (
                  <div
                    key={colorKey}
                    className={`color-option ${colors[colorKey].className} ${
                      selectedColor === colorKey ? 'active' : ''
                    }`}
                    onClick={() => setSelectedColor(colorKey)}
                    title={colorData.name}
                  />
                ))}
              </div>
            </div>



            {/* Solve Button */}
            <button
              onClick={solveCube}
              disabled={isLoading}
              className="solve-button"
              title="Find solution for current cube"
            >
              {isLoading ? ' Solving...' : 'Solve the Cube'}
            </button>
          </div>

          {/* Results Section */}
          <div className="results-section">
            <h2 className="section-title">Solution</h2>

            {/* Cube Notation Info */}
            <div className="notation-guide">
              <h4 className="notation-title">Solution Guide</h4>
              <h6 className="notation-text">
                F = Front, B = Back,R = Right, 
                L = Left, U = Up, D = Down ||  
                ' = Counter-clockwise, 2 = 180° turn
              </h6>
            </div>

            {/* Error Display */}
            {error && (
              <div className="error-message">
                <h3 className="error-title">Error</h3>
                <p className="error-text">{error}</p>
                {/* <div style={{marginTop: '10px', fontSize: '0.9em', opacity: '0.8'}}>
                  Try resetting the cube or check the console for more details
                </div> */}
              </div>
            )}

            {/* Solution Display */}
            {solution && (
              <div className="solution-display">
                <h3 className="solution-title">Solution Found :)</h3>
                <div className="solution-content">
                  <p className="solution-stats">
                    <strong>Total moves:</strong> {solution.totalMoves}
                  </p>
                  <div>
                    {/* <p className="solution-steps-title">Moves:</p> */}
                    <div className="solution-moves">
                      {solution.moves}
                    </div>
                  </div>
                  {solution.steps && solution.steps.length > 0 && (
                    <div className="detailed-steps">
                      <p className="solution-steps-title">Follow the Steps to Solve:</p>
                      <img src="funnygif.webp" alt=":)" />
                      <ol className="solution-steps">
                        {solution.steps.map((step, index) => (
                          <li key={index} className="solution-step">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Placeholder when no solution */}
            {!solution && !error && !isLoading && (
              <div className="solution-placeholder">
                <div className="placeholder-icon">
                  <img src="rubLogo.png" alt="cube"/>
                </div>
                {/* <p className="placeholder-text">
                  Configure your cube and click "Solve Cube" to get the solution
                </p> */}
                <div style={{marginTop: '15px', fontSize: '0.9em', opacity: '0.7', color: '#ffffff'}}>
                  Click "Scramble" to create a solvable puzzle, or manually configure your cube colors
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  //</div>
  );
};

export default RubiksCubeSolver;