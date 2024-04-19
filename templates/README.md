# (Title of code snippet)

(Explain context for code snippet)

(Optional) This code snippet was contributed by [YOUR_GITHUB_ID](https://github.com/YOUR_GITHUB_ID).

## Code

(Point out specific files in the code snippet, and explain their implmentation, and how it works)

## References

- (Links to relevant HIPs, stackoverflow questions, documentation, etc)

TODO delete below line!
----

To create a npm/ Javascript task based example:

```
SNIPPET="foo-bar"
cd ../
pwd
echo "Ensure in root directroy of hedera-code-snippets"
git fetch origin main:maincod
git checkout -b feat/${SNIPPET}
cp -r ./templates ./${SNIPPET}
cd ./${SNIPPET}
echo "Edit package.json to update Hedera SDK version"
cp .env.example .env
echo "Replace .env placeholder values"
echo "Rename task.js and update its contents"
npm i
```
