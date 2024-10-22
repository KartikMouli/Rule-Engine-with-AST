import re
from django.http import JsonResponse
from .models import Node, Rule
import json
from django.views.decorators.csrf import csrf_exempt


class RuleParser:
    def __init__(self):
        self.tokens = []  # Store tokens from the input string
        self.index = 0  # Index to track position in the tokens

    def tokenize(self, s: str):
        print(f"Tokenizing: {s}")  # Debugging
        # Updated regex pattern to match operands, operators, and parentheses correctly
        token_pattern = re.compile(
            r"\s*(?:(AND|OR)|(\()|(\))|(\w+\s*[<>=]+\s*[\d]+|(\w+)\s*=\s*('[^']*'|\"[^\"]*\"))|\S)"
        )
        self.tokens = token_pattern.findall(s)

        # Flattening the list and keeping only relevant tokens
        self.tokens = [
            token[0]
            or token[1]
            or token[2]
            or token[3]
            or (token[4] + " = " + token[5].strip("'\""))
            for token in self.tokens
            if any(token)
        ]
        print(f"Tokens: {self.tokens}")  # Debugging

    def parse(self, s: str):
        self.tokenize(s)  # Tokenize the input string
        self.index = 0
        return self.expression()

    def expression(self):
        print(f"Parsing expression")  # Debugging
        left = self.term()
        while self.index < len(self.tokens) and self.tokens[self.index] in [
            "AND",
            "OR",
        ]:
            op = self.tokens[self.index]
            self.index += 1
            right = self.term()
            if right is None:
                raise ValueError("Invalid expression: missing right operand.")
            left = {"type": "operator", "value": op, "left": left, "right": right}
        print(f"Expression AST: {left}")  # Debugging
        return left

    def term(self):
        print(f"Parsing term")  # Debugging
        # Parse individual conditions or nested expressions
        if self.index < len(self.tokens) and self.tokens[self.index] == "(":
            self.index += 1  # Skip '('
            node = self.expression()
            if self.index < len(self.tokens) and self.tokens[self.index] == ")":
                self.index += 1  # Skip ')'
            return node
        else:
            # Must be a condition (operand)
            if self.index >= len(self.tokens):  # Check for None before processing
                return None
            condition = self.tokens[self.index]
            self.index += 1
            return self.parse_condition(condition)

    def parse_condition(self, condition):
        print(f"Parsing condition: {condition}")  # Debugging
        # Updated regex pattern to capture conditions correctly
        condition_pattern = re.match(
            r"\s*(\w+)\s*([<>=]+)\s*(['\"]?)(.*?)(['\"]?)\s*$", condition.strip()
        )

        if condition_pattern:
            attribute, operator, start_quote, value, end_quote = (
                condition_pattern.groups()
            )
            print(
                f"Parsed condition - Attribute: {attribute}, Operator: {operator}, Value: {value}"
            )  # Debugging

            # If start_quote is set, ensure that quotes are stripped from the value
            if start_quote:
                value = value.strip(start_quote + end_quote)  # Strip quotes from value

            # Ensure the operator is valid
            if operator not in [">", "<", "=", ">=", "<="]:
                raise ValueError(f"Invalid operator in condition: {condition}")

            # Return a structured operand node
            return {
                "type": "operand",
                "value": {
                    "attribute": attribute.strip(),
                    "operator": operator.strip(),
                    "comparison_value": value.strip(),  # Use the raw value, quotes are optional in the input
                },
            }
        else:
            raise ValueError(f"Invalid condition format: {condition}")


# API to handle rule creation and saving to the database
@csrf_exempt
def create_rule_api(request):
    body = json.loads(request.body)  # Load the JSON body
    rule_string = body.get("rule")  # Extract the rule string from the loaded JSON
    print(f"Received rule string: {rule_string}")  # Debugging

    if not rule_string:
        return JsonResponse({"error": "Rule string is required"}, status=400)

    try:
        # Instantiate the RuleParser and generate the AST
        parser = RuleParser()
        ast = parser.parse(rule_string)

        print(f"Generated AST: {ast}")  # Debugging

        # Ensure AST is valid before saving
        if ast is None:
            return JsonResponse(
                {"error": "Failed to parse the rule into AST."}, status=400
            )

        # Save the rule in the database
        rule = Rule(
            rule_id="rule_" + str(hash(rule_string)), ast=json.dumps(ast)
        )  # Convert dict to JSON string
        rule.save()

        return JsonResponse({"rule_id": rule.rule_id, "ast": ast})

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Debugging
        return JsonResponse({"error": str(e)}, status=500)


class RuleCombiner:
    def __init__(self):
        self.operator_count = {
            "AND": 0,
            "OR": 0,
        }

    def count_operators(self, ast):
        """Recursively count the occurrences of operators in an AST."""
        if ast["type"] == "operator":
            self.operator_count[ast["value"]] += 1
            if ast.get("left"):
                self.count_operators(ast["left"])
            if ast.get("right"):
                self.count_operators(ast["right"])

    def combine(self, asts):
        """Combine multiple ASTs into a single AST based on operator frequency."""
        for ast in asts:
            self.count_operators(ast)

        # Determine the most frequent operator
        main_operator = (
            "AND" if self.operator_count["AND"] >= self.operator_count["OR"] else "OR"
        )

        # Create a root node for the combined AST
        combined_ast = {
            "type": "operator",
            "value": main_operator,
            "left": None,
            "right": None,
        }

        # Combine left and right subtrees
        left_subtree = None
        right_subtree = None

        # Create a left subtree from the first half of the ASTs
        for i, ast in enumerate(asts):
            if i < len(asts) // 2:
                left_subtree = (
                    ast
                    if left_subtree is None
                    else {
                        "type": "operator",
                        "value": main_operator,
                        "left": left_subtree,
                        "right": ast,
                    }
                )

        # Create a right subtree from the second half of the ASTs
        for i, ast in enumerate(asts):
            if i >= len(asts) // 2:
                right_subtree = (
                    ast
                    if right_subtree is None
                    else {
                        "type": "operator",
                        "value": main_operator,
                        "left": right_subtree,
                        "right": ast,
                    }
                )

        combined_ast["left"] = left_subtree
        combined_ast["right"] = right_subtree

        return combined_ast


def combine_rules(rules):
    """Combine a list of rule strings into a single AST."""
    parser = RuleParser()  # Use the RuleParser class defined earlier
    asts = [parser.parse(rule) for rule in rules]

    # Use RuleCombiner to combine the ASTs
    combiner = RuleCombiner()
    combined_ast = combiner.combine(asts)

    return combined_ast


@csrf_exempt
def combine_rules_api(request):
    # Extract rule strings from the request
    body = json.loads(request.body)
    rule_strings = body.get(
        "rules"
    )  # Assuming the rules are passed as a list of query parameters

    print(f"Received rule strings: {rule_strings}")  # Debugging

    if not rule_strings:
        return JsonResponse(
            {"error": "At least one rule string is required"}, status=400
        )

    try:
        # Combine the rules using the combine_rules function
        combined_ast = combine_rules(rule_strings)

        # Create a unique rule_id for the combined rule
        rule_id = "combined_rule_" + str(hash(rule_strings[0]))

        # Save the combined rule in the database
        combined_rule = Rule(rule_id=rule_id, ast=json.dumps(combined_ast))

        combined_rule.save()

        return JsonResponse({"rule_id": rule_id, "combined_ast": combined_ast})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def evaluate_rule(ast, data):
    if ast["type"] == "operand":
        attribute = ast["value"]["attribute"]
        operator = ast["value"]["operator"]
        comparison_value = ast["value"]["comparison_value"]

        actual_value = data.get(attribute)

        if operator == ">":
            return actual_value > float(comparison_value)
        elif operator == "<":
            return actual_value < float(comparison_value)
        elif operator == "=":
            return actual_value == comparison_value
        # Add more operators as needed

    elif ast["type"] == "operator":
        left = ast["left"]
        right = ast["right"]
        operator = ast["value"]

        left_result = evaluate_rule(left, data)
        right_result = evaluate_rule(right, data)

        if operator == "AND":
            return left_result and right_result
        elif operator == "OR":
            return left_result or right_result

    return False


# API to evaluate the rule based on AST and input data
@csrf_exempt
def evaluate_rule_api(request):
    if request.method == "POST":
        try:
            # Get the request body
            body = json.loads(request.body)

            # Extract AST and data from the request
            ast = body.get("ast")
            data = body.get("data")

            print(ast, data)

            if not ast or not data:
                return JsonResponse(
                    {"error": "Both AST and data are required."}, status=400
                )

            # Evaluate the rule
            result = evaluate_rule(ast, data)

            return JsonResponse({"result": result})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Only POST requests are allowed."}, status=405)


def modify_rule(rule_id, new_rule_string):
    """Utility function to modify a rule and update its AST."""
    try:
        # Retrieve existing rule from database
        rule = Rule.objects.get(rule_id=rule_id)
        parser = RuleParser()
        new_ast = parser.parse(new_rule_string)

        # Update the AST in the existing rule
        rule.ast = json.dumps(new_ast)  # Save the modified AST
        rule.save()

        return {"rule_id": rule_id, "new_ast": new_ast}

    except Rule.DoesNotExist:
        return {"error": "Rule not found."}
    except ValueError as e:
        return {"error": str(e)}
    except Exception as e:
        return {"error": str(e)}


@csrf_exempt
def modify_rule_api(request, rule_id):
    """API endpoint to modify a rule."""
    body = json.loads(request.body)  # Parse JSON request body
    new_rule_string = body.get("new_rule")

    if not new_rule_string:
        return JsonResponse({"error": "New rule string is required"}, status=400)

    # Call the utility function to modify the rule
    result = modify_rule(rule_id, new_rule_string)

    if "error" in result:
        if result["error"] == "Rule not found.":
            return JsonResponse({"error": result["error"]}, status=404)
        else:
            return JsonResponse({"error": result["error"]}, status=400)

    # If successful, return the updated rule information
    return JsonResponse(result)


@csrf_exempt
def get_all_rules_api(request):
    try:
        # Fetch all rules from the database
        rules = Rule.objects.all().values(
            "rule_id", "ast"
        )  # Adjust fields as necessary

        # Convert the QuerySet to a list
        rules_list = list(rules)

        return JsonResponse(
            rules_list, safe=False
        )  # safe=False allows returning a list
    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Debugging
        return JsonResponse({"error": str(e)}, status=500)
