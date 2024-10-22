from django.urls import path
from .views import create_rule_api, combine_rules_api,evaluate_rule_api,modify_rule_api,get_all_rules_api


urlpatterns = [
    path("create-rule/", create_rule_api,name="create_rule_api"),
    path("combine-rules/", combine_rules_api, name="combine_rules_api"),
    path("evaluate-rule/", evaluate_rule_api, name="evaluate_rule_api"),
    path("modify-rule/<str:rule_id>/", modify_rule_api, name="modify_rule_api"),
    path("all-rules/", get_all_rules_api, name="get_all_rules_api"),

]
