// src/components/RuleInput.tsx
import React, { useState } from 'react';
import { createRule } from '../services/rulesAPI';

const RuleInput: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
    const [rule, setRule] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await createRule(rule);
            console.log(data);
            onSubmit(); // Refresh the rules list after creation
            setRule(''); // Clear the input after submission
            alert("new rule added to list !")
        } catch (error) {
            alert('Error creating rule: ' + error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
            <h2 className="text-xl font-semibold mb-4 text-center">Create Rule</h2>


            <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center mb-4">
                <input
                    type="text"
                    value={rule}
                    onChange={(e) => setRule(e.target.value)}
                    placeholder="Enter rule (e.g. (age > 30 AND department = 'Sales'))"
                    required
                    className="border p-2 rounded w-full h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200 w-full"
                >
                    Create Rule
                </button>
            </form>
        </div >
    );
};

export default RuleInput;
