# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2025-05-23

### Added
- Added `openBrowserOptions` parameter to `connectToApp` function to support opening the browser in a new tab in web environments.

## [0.1.2] - 2025-05-19

### Changed
- Updated `connectToApp` and `handleURL` functions to accept `URL` objects instead of strings for better type safety and consistency.

## [0.1.1] - 2025-05-12

### Added
- Added `buildAppConnectionParams` function to the `useAppConnect` hook to build connection parameters with the current pathname.
- Added `inNewTab` option to `openBrowser` function for web environments.

### Changed
- Renamed `namespace` parameter to `pathname` in the `useAppConnect` hook for clarity.
- Updated `openBrowser` to use `window.open` when `inNewTab` is true in web environments.

## [0.1.0] - 2025-05-12

### Added
- Initial release of expo-icp-app-connect.
- React hook (`useAppConnect`) for managing deep link connections to other apps.
- Support for secure session handling and redirect management.
- Generic type support for connection and result parameters.
- Helper functions: `connectToApp`, `dismissBrowser`, `handleURL`, and `openBrowser`.