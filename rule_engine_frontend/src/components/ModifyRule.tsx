import React, { useState } from 'react';
import { modifyRule } from '../services/rulesAPI'; // Import API function for modifying rules

interface ModifyRuleProps {
    onModify: () => void; // Callback to refresh the rule list after modification
}

const ModifyRule: React.FC<ModifyRuleProps> = ({ onModify }) => {
    const [ruleId, setRuleId] = useState('');
    const [newRule, setNewRule] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!ruleId || !newRule) {
            alert('Both rule ID and new rule are required');
            return;
        }

        try {
            await modifyRule(ruleId, newRule); // Call the API to modify the rule
            onModify(); // Refresh the rule list after modification
            setRuleId(''); // Reset fields after submission
            setNewRule('');
            alert("rule is modified!")
        } catch (error) {
            alert('Error modifying rule: ' + error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
            <h2 className="text-xl font-semibold mb-4 text-center">Modify Rule</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center mb-4">
                <input
                    type="text"
                    value={ruleId}
                    onChange={(e) => setRuleId(e.target.value)}
                    placeholder="Enter Rule ID"
                    required
                    className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
                <input
                    type="text"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Enter New Rule (e.g. age > 25 AND department = 'HR')"
                    required
                    className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-3 rounded-lg ml-2 hover:bg-blue-600 transition duration-200"
                >
                    Modify Rule
                </button>
            </form>
        </div>
    );
};

export default ModifyRule;
