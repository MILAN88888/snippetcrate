import { Box, Center, Code, Heading, Stack } from "@chakra-ui/react";
import { __ } from "@wordpress/i18n";
import React, { Component, ErrorInfo, PropsWithChildren } from "react";

class ErrorBoundary extends Component<PropsWithChildren<any>, any> {
  constructor(props: PropsWithChildren<any>) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.error) {
      return (
        <Center minH="90vh">
          <Box textAlign="center">
            <Stack direction="column" align="center">
              <style>{"a {text-decoration: underline}"}</style>
              <Heading>
                {__("Oops! Something went wrong.", "snippet-master")}
              </Heading>
              {this.state.error instanceof Error ? (
                <Code>{this.state.error.toString()}</Code>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: this.state.error?.message
                  }}
                />
              )}
            </Stack>
          </Box>
        </Center>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
