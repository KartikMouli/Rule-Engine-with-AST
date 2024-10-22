import React, { useState, useEffect } from 'react';
import RuleInput from './components/RuleInput';
import CombineRules from './components/CombineRules';
import EvaluateRule from './components/EvaluateRule';
import RuleList from './components/RuleList';

import { fetchRules } from './services/rulesAPI';
import ModifyRule from './components/ModifyRule';

const App: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]); // State to hold rules
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const loadRules = async () => {
    try {
      const fetchedRules = await fetchRules();
      setRules(fetchedRules); // Update rules state
    } catch (error) {
      alert('Error fetching rules: ' + error);
    }
  };

  const handleCreateRule = async () => {
    await loadRules(); // Reload rules after a new rule is created
  };

  const handleCombineRules = async () => {
    await loadRules(); // Reload rules after combining
  };

  const handleModifyRule = async () => {
    await loadRules(); // Reload rules after modifying a rule
  };

  const handleEvaluate = (result: any) => {
    setEvaluationResult(result); // Set evaluation result
  };

  // Load rules initially when the component mounts
  useEffect(() => {
    loadRules();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">Rule Engine with AST</h1>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
        <div className="col-span-1">
          <RuleInput onSubmit={handleCreateRule} />
        </div>
        <div className="col-span-1">
          <CombineRules onCombine={handleCombineRules} />
        </div>
        <div className="col-span-1">
          <EvaluateRule onEvaluate={handleEvaluate} />
          {evaluationResult && (
            <div className="mt-4 p-4 border rounded-lg bg-white shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Evaluation Result:</h3>
              <pre className="text-sm text-gray-600 bg-gray-100 p-4 rounded-lg overflow-x-auto">{JSON.stringify(evaluationResult, null, 2)}</pre>
            </div>
          )}
        </div>
        <div className="col-span-1">
          <ModifyRule onModify={handleModifyRule} /> {/* Add ModifyRule component */}
        </div>
      </div>
      <div className="mt-8">
        <RuleList rules={rules} /> {/* Pass rules as a prop */}
      </div>


    </div>
  );
};

export default App;
