// import React, { useRef, useEffect } from "react";
// import SignaturePad from "signature_pad";

// const SignaturePadComponent = ({ onSignatureComplete }) => {
//   const canvasRef = useRef(null);
//   const signaturePadRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     signaturePadRef.current = new SignaturePad(canvas, {
//       backgroundColor: "rgb(255, 255, 255)", // Set background to white
//       penColor: "rgb(0, 0, 0)", // Set pen color to black
//     });

//     return () => {
//       // Cleanup
//       signaturePadRef.current.off();
//     };
//   }, []);

//   const clearSignature = () => {
//     signaturePadRef.current.clear();
//   };

//   const saveSignature = () => {
//     if (signaturePadRef.current.isEmpty()) {
//       alert("Please provide a signature first.");
//     } else {
//       const dataURL = signaturePadRef.current.toDataURL("image/png");
//       onSignatureComplete(dataURL);
//     }
//   };

//   return (
//     <div>
//       <canvas
//         ref={canvasRef}
//         style={{ border: "1px solid #000", width: "100%", height: "200px" }}
//       ></canvas>
//       <div className="flex justify-end mt-2">
//         <button
//           onClick={clearSignature}
//           className="px-4 py-2 bg-red-500 text-white rounded mr-2"
//         >
//           Clear
//         </button>
//         <button
//           onClick={saveSignature}
//           className="px-4 py-2 bg-green-500 text-white rounded"
//         >
//           Save Signature
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SignaturePadComponent;
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import SignaturePad from "signature_pad";

const SignaturePadComponent = forwardRef((_, ref) => {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    signaturePadRef.current = new SignaturePad(canvas, {
      backgroundColor: "rgb(255, 255, 255)", // Set background to white
      penColor: "rgb(0, 0, 0)", // Set pen color to black
    });

    return () => {
      // Cleanup
      signaturePadRef.current.off();
    };
  }, []);

  // Expose the method to get the signature data URL
  useImperativeHandle(ref, () => ({
    getSignature: () => {
      return signaturePadRef.current.isEmpty() ? null : signaturePadRef.current.toDataURL("image/png");
    },
    clearSignature: () => {
      signaturePadRef.current.clear();
    }
  }));

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid #000", width: "100%", height: "200px" }}
      ></canvas>
      <div className="flex justify-end mt-2">
        <button
          onClick={() => signaturePadRef.current.clear()} // Clear the signature
          className="px-4 py-2 bg-red-500 text-white rounded mr-2"
        >
          Clear
        </button>
      </div>
    </div>
  );
});

export default SignaturePadComponent;
