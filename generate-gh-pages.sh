#!/usr/bin/env bash

# Stolen from https://github.com/nevir/groc

set -e # Stop on the first failure that occurs

GH_PAGES_TEMP_PATH=.git/gh-pages-tmp
TARGET_BRANCH=gh-pages
TARGET_REMOTE=origin

# Git spits out status information on $stderr, and we don't want to relay that as an error to the
# user.  So we wrap git and do error handling ourselves...
exec_git() {
  args=''
  for (( i = 1; i <= $#; i++ )); do
    eval arg=\$$i
    if [[ $arg == *\ * ]]; then
      #} We assume that double quotes will not be used as part of argument values.
      args="$args \"$arg\""
    else
      args="$args $arg"
    fi
  done

  set +e
  #} Even though we wrap the arguments in quotes, bash is splitting on whitespace within.  Why?
  result=`eval git $args 2>&1`
  status=$?
  set -e

  if [[ $status -ne 0 ]]; then
    echo "$result" >&2
    exit $status
  fi

  echo "$result"
  return 0
}

if [[ `git status -s` != "" ]]; then
  echo "Please commit or stash your changes before publishing documentation to github!" >&2
  exit 1
fi

CURRENT_BRANCH=`git branch 2>/dev/null| sed -n '/^\*/s/^\* //p'`
CURRENT_COMMIT=`git rev-parse HEAD`

if [[ `git branch --no-color | grep " $TARGET_BRANCH"` == "" ]]; then
  # Do a fetch from the target remote to see if it was created remotely
  exec_git fetch $TARGET_REMOTE

  # Does it exist remotely?
  if [[ `git branch -a --no-color | grep " remotes/$TARGET_REMOTE/$TARGET_BRANCH"` == "" ]]; then
    echo "No '$TARGET_BRANCH' branch exists.  Creating one"
    exec_git symbolic-ref HEAD refs/heads/$TARGET_BRANCH
    rm .git/index

    exec_git clean -fdq
  else
    TARGET_REMOTE=origin
    echo "No local branch '$TARGET_BRANCH', checking out '$TARGET_REMOTE/$TARGET_BRANCH' and tracking that"
    exec_git checkout -b $TARGET_BRANCH $TARGET_REMOTE/$TARGET_BRANCH
  fi

else
  exec_git checkout $TARGET_BRANCH
fi

# We want to keep in complete sync (deleting old docs, or cruft from previous documentation output)
git ls-files docs     | xargs rm
git ls-files examples | xargs rm

cp -Rf $GH_PAGES_TEMP_PATH/* .

# Do nothing unless we actually have changes
if [[ `git status -s` != "" ]]; then
  exec_git add -A
  exec_git commit -m "Generated documentation for $CURRENT_COMMIT"
fi

exec_git checkout $CURRENT_BRANCH
