import { GradientRange } from '../_components/GradientRange/GradientRange.tsx';
import { WidgetBuilder } from '../_components/WidgetBuilder.tsx';

export const Consumption = () => {
  return (
    <WidgetBuilder
      items={[
        {
          label: 'Consumption',
          content: (
            <GradientRange gradient={{ from: '#304CBFFF', to: '#F24646FF' }} startLabel={`Low`} endLabel={`High`} />
          ),
        },
      ]}
    />
  );
};
