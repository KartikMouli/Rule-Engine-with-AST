// src/components/CombineRules.tsx
import React, { useState } from 'react';
import { combineRules } from '../services/rulesAPI';

const CombineRules: React.FC<{ onCombine: () => void }> = ({ onCombine }) => {
    const [rules, setRules] = useState<string[]>(['']);

    const handleChange = (index: number, value: string) => {
        const newRules = [...rules];
        newRules[index] = value;
        setRules(newRules);
    };

    const handleAddRule = () => {
        setRules([...rules, '']);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await combineRules(rules);
            onCombine(); // Refresh the rules list after combining
            setRules(['']); // Reset the rules after submission
            alert("rules are combined and added to rules list")
        } catch (error) {
            alert('Error combining rules: ' + error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
            <h2 className="text-xl font-semibold mb-4 text-center">Combine Rules</h2>
            <form onSubmit={handleSubmit}>
                {rules.map((rule, index) => (
                    <div key={index} className="mb-3">
                        <input
                            type="text"
                            value={rule}
                            onChange={(e) => handleChange(index, e.target.value)}
                            placeholder={`Rule ${index + 1} : Enter rule (e.g. (age > 30 AND department = 'Sales'))`}
                            required
                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                ))}
                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={handleAddRule}
                        className="bg-green-500 text-white p-2 rounded transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Add Rule
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Combine Rules
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CombineRules;
