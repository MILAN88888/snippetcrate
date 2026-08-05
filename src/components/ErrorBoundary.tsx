import { Box, Center, Code, Heading, Stack } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import React, { Component, ErrorInfo, PropsWithChildren } from "react";

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<
  PropsWithChildren<unknown>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<unknown>) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.error) {
      return (
        <Center minH="90vh">
          <Box textAlign="center">
            <Stack direction="column" align="center">
              <Heading>
                {__("Oops! Something went wrong.", "snippet-master")}
              </Heading>
              <Code>{this.state.error.toString()}</Code>
            </Stack>
          </Box>
        </Center>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
