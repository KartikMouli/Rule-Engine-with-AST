# Create your models here.
from django.db import models

class Node(models.Model):
    node_type = models.CharField(max_length=20)  # "operator" or "operand"
    left = models.JSONField(null=True, blank=True)  # Left child (another Node)
    right = models.JSONField(null=True, blank=True)  # Right child (another Node)
    value = models.CharField(max_length=100, null=True, blank=True)  # Value for operand nodes

class Rule(models.Model):
    rule_id = models.CharField(max_length=50, unique=True)
    ast = models.JSONField()  # Store AST as JSON
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
