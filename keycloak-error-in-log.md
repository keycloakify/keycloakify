# 🛑 Keycloak error in log

If you ever encounter one of these errors:

```log
FTL stack trace ("~" means nesting-related):
        - Failed at: #local value = object[key]  [in template "login.ftl" in macro "ftl_object_to_js_code_declaring_an_object" at line 70, column 21]
        - Reached through: @compress  [in template "login.ftl" in macro "ftl_object_to_js_code_declaring_an_object" at line 36, column 5]
        - Reached through: @ftl_object_to_js_code_declaring_an_object object=value depth=(dep...  [in template "login.ftl" in macro "ftl_object_to_js_code_declaring_an_object" at line 81, column 27]
        - Reached through: @compress  [in template "login.ftl" in macro "ftl_object_to_js_code_declaring_an_object" at line 36, column 5]
        - Reached through: @ftl_object_to_js_code_declaring_an_object object=(.data_model) de...  [in template "login.ftl" at line 163, column 43]
```

**It's just noise**, they can be safely ignored.\
You can, however, and are encouraged to report any that you would spot.\
Just [open an issue about it](https://github.com/InseeFrLab/keycloakify/issues/new) and I will release a patched version of Keycloakify in the better delays.
