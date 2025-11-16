package cmd

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"mycli/internal"

	"github.com/spf13/cobra"
)

func readInputOrArg(args []string) (string, error) {
	// 標準入力がパイプ/リダイレクトされている場合はそれを優先
	stat, _ := os.Stdin.Stat()
	if (stat.Mode() & os.ModeCharDevice) == 0 {
		scanner := bufio.NewScanner(os.Stdin)
		var sb strings.Builder
		for scanner.Scan() {
			sb.WriteString(scanner.Text())
		}
		return sb.String(), nil
	}
	if len(args) > 0 {
		return args[0], nil
	}
	return "", fmt.Errorf("no input provided")
}

var base64Cmd = &cobra.Command{
	Use:   "base64",
	Short: "Base64 encode/decode",
}

var encodeCmd = &cobra.Command{
	Use:   "encode [text]",
	Short: "Encode text to base64",
	Args:  cobra.MaximumNArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		input, err := readInputOrArg(args)
		if err != nil {
			return err
		}
		fmt.Println(internal.EncodeToBase64(input))
		return nil
	},
}

var decodeCmd = &cobra.Command{
	Use:   "decode [b64text]",
	Short: "Decode base64 to text",
	Args:  cobra.MaximumNArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		input, err := readInputOrArg(args)
		if err != nil {
			return err
		}
		out, derr := internal.DecodeFromBase64(input)
		if derr != nil {
			return derr
		}
		fmt.Println(out)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(base64Cmd)
	base64Cmd.AddCommand(encodeCmd)
	base64Cmd.AddCommand(decodeCmd)
}
