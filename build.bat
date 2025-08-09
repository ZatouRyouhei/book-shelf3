cd /d %~dp0
call npm run build
aws s3 rm s3://bookshelf-satouxr --recursive
aws s3 sync ./dist s3://bookshelf-satouxr
aws cloudfront create-invalidation --distribution-id E2O1URQY6ORPVY --paths "/*"
