import React from 'react';

interface Rule {
    rule_id: string;
    ast: string;
}

interface RuleListProps {
    rules: Rule[];
}

const RuleList: React.FC<RuleListProps> = ({ rules }) => {
    const handleRuleClick = (rule: any) => {
        const ast = JSON.parse(rule.ast); // Parse the AST string back to an object
        const formattedRule = {
            rule_id: rule.rule_id,
            ast: ast,
        };

        const newTab = window.open();
        if (newTab) {
            newTab.document.write('<pre>' + JSON.stringify(formattedRule, null, 2) + '</pre>');
            newTab.document.close();
        }
    };

    return (
        <div className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="text-xl font-semibold mb-4">Rules List</h2>
            
            {rules.length > 0 ? (
                <ul className="list-disc pl-5">
                    {rules.map((rule) => (
                        <li key={rule.rule_id} className="cursor-pointer text-blue-600 hover:underline" onClick={() => handleRuleClick(rule)}>
                            {rule.rule_id}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No rules available.</p>
            )}
        </div>
    );
};

export default RuleList;
