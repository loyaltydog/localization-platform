# Agent instructions

These instructions apply to AI coding assistants working in this repository.

## Code review

Reviews use CodeRabbit, not Greptile. Settings live in `.coderabbit.yaml`. Leave `greptile.json` unchanged.

CodeRabbit does not review automatically when a pull request is opened. Automatic review is off (`reviews.auto_review.enabled` is false), including drafts.

Run an adversarial self-review and repeat it until the change is clean.

This is a low-risk repository. Skip the final CodeRabbit review before merging to `main`. Loc's approval is not required for `main`.

When a CodeRabbit review is used, `greploop` means that CodeRabbit loop, including a request typed as "greploop": comment `@coderabbitai review` on the pull request and iterate until the review is satisfactory.
