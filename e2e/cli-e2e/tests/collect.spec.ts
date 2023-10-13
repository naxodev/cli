import { PluginReport, Report, reportSchema } from '@code-pushup/models';
import { executeProcess, readJsonFile, readTextFile } from '@code-pushup/utils';

const omitVariableData = ({
  date,
  duration,
  version,
  ...report
}: Report | PluginReport) => report;

const omitVariableReportData = (report: Report) =>
  omitVariableData({
    ...report,
    plugins: report.plugins.map(omitVariableData) as PluginReport[],
  });

describe('CLI collect', () => {
  it('should run ESLint plugin and create report.json', async () => {
    const { code, stderr } = await executeProcess({
      command: 'npx',
      args: ['../../dist/packages/cli', 'collect'],
      cwd: 'examples/react-todos-app',
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');

    const report = await readJsonFile('tmp/react-todos-app/report.json');

    expect(() => reportSchema.parse(report)).not.toThrow();
    expect(omitVariableReportData(report as Report)).toMatchSnapshot();
  });

  it('should create report.md', async () => {
    const { code, stderr } = await executeProcess({
      command: 'npx',
      args: ['../../dist/packages/cli', 'collect', '--format=md'],
      cwd: 'examples/react-todos-app',
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');

    const md = await readTextFile('tmp/react-todos-app/report.md');

    expect(md).toContain('# Code Pushup Report');
  });

  it('should print report summary to stdout', async () => {
    const { code, stdout, stderr } = await executeProcess({
      command: 'npx',
      args: ['../../dist/packages/cli', 'collect', '--format=stdout'],
      cwd: 'examples/react-todos-app',
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');

    expect(stdout).toContain('Code Pushup Report');
    expect(stdout).toContain('Generated reports');
    expect(stdout).toContain('report.json');
  });
});
