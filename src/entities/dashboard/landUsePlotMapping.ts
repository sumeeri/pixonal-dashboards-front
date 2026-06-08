import { PlotConstructionStatus } from '../../app/stores/3d/landUse/LandUseDataTypes';
import { Slide } from './types';

export function mapLandUsePlotTypes(slide: Slide, _type: string): PlotConstructionStatus | undefined {
  const type = _type.trim();

  switch (slide) {
    case Slide.LAND_USE_RESIDENTIAL:
      switch (type) {
        case 'Apartment':
          return 'RESIDENTIAL - Apartment';
        case 'Villa':
          return 'RESIDENTIAL - Villa';

        default:
          return 'RESIDENTIAL - Villa';
      }

    // case Slide.LAND_USE_RESIDENTIAL:
    //   switch (type) {
    //     case 'Commercial':
    //     case 'COMMERCIALVILLA':
    //     case 'INVESTMENTRESIDENTAL':
    //     case 'INVESTMENTVILLA':
    //     case 'PALACE':
    //     case 'RESIDENTIALVILLA':
    //     case 'RESIDENTIALVILLAS':
    //     case 'VILLA':
    //     case 'VILLA COMPLEX':
    //     case 'GOVERNMENT VILLA':
    //     case 'GOVERNMENTVILLA':
    //     case 'RESIDENTAL VILLA':
    //     case 'RESIDENTIALLAND':
    //     case 'RESIDENTAL LAND':
    //     case 'TEMPORARYRESIDANTIALLAND':
    //     case 'UNDEFINED':
    //       return 'RESIDENTIAL - Villa';
    //
    //     case 'PUBLICHOUSE':
    //     case 'RESIDENTIAL':
    //     case 'RESIDENTIALAPARTMENTS':
    //     case 'RESIDENTIALCOMPLEX':
    //     case 'COMMERCIALCOMMUNITYSERVICE':
    //     case 'EMPLOYEE HOUSING':
    //     case 'EMPLOYEEHOUSING':
    //     case 'GOVERNMENT EMPLOYEE HOUSING':
    //     case 'HOSPITALITY BUILDING':
    //     case 'IMAM HOUSING':
    //     case 'LABOR HOUSING':
    //     case 'LABORHOUSING':
    //     case 'MEDICAL STAFF HOUSING':
    //     case 'MULTI USAGE':
    //     case 'OTHER':
    //     case 'OTHER RESIDENTIAL':
    //     case 'POLICE HOUSING':
    //     case 'PUBLIC HOUSE':
    //     case 'PUBLIC HOUSING':
    //     case 'RESIDENTAL COMPLEX':
    //     case 'RESIDENTIAL/INVESTMENT':
    //     case 'RESTHOUSE':
    //     case 'SMALL PUBLIC HOUSING':
    //     case 'STAFF ACCOMODATION':
    //     case 'TEACHER HOUSING':
    //     case 'TEMPORARY CAMP':
    //     case 'TEMPORARY SEA RESORTS':
    //       return 'RESIDENTIAL - Apartment';
    //
    //     default:
    //       return 'RESIDENTIAL - Apartment';
    //   }

    case Slide.LAND_USE_RETAIL:
      switch (type) {
        case 'Mall':
          return 'RETAIL - Mall';
        case 'Commercial':
          return 'RETAIL - Other';

        default:
          return 'RETAIL - Other';
      }

    case Slide.LAND_USE_OTHERS:
      switch (type) {
        case 'Religious':
          return 'OTHERS - Religious';
        case 'Park':
          return 'OTHERS - Park';
        case 'Other':
          return 'OTHERS - Other';
        default:
          return 'OTHERS - Other';
      }
    case Slide.LAND_USE_SCHOOLS:
    case Slide.LAND_USE_EDUCATION:
      switch (type) {
        case 'Nurseries':
          return 'SCHOOLS - Nurseries';
        case 'Private':
          return 'SCHOOLS - Private';
        case 'Higher Education':
          return 'SCHOOLS - Higher Education';
        case 'Public':
          return 'SCHOOLS - Public';
        case 'POD schools':
          return 'SCHOOLS - POD Schools';
        case 'Charter schools':
          return 'SCHOOLS - Charter Schools';
        case 'Tolerance Schools':
          return 'SCHOOLS - Tolerance Schools';

        default:
          return 'SCHOOLS - Public';

        // case 'UNIVERSITY':
        // case 'ACADEMY':
        // case 'COLLEGE':
        // case 'VOCATIONALTRAININGCENTER':
        //   return 'SCHOOLS - Higher Education';
        // case 'KINDERGARTEN':
        //   return 'SCHOOLS - Nurseries';
        // case 'PRIVATESCHOOL':
        //   return 'SCHOOLS - Private';
        // case 'SCHOOL':
        //   return 'SCHOOLS - Public';
      }

    case Slide.LAND_USE_INDUSTRY:
      switch (type) {
        case 'Industrial Land':
        case 'Factory':
        default:
          return 'INDUSTRY - Default';
      }

    case Slide.LAND_USE_MEDICAL:
      switch (type) {
        case 'Medical':
          return 'MEDICAL - Active';

        default:
          return 'MEDICAL - Active';
      }

    case Slide.LAND_USE_OFFICES:
      switch (type) {
        case 'Office':
          return 'OFFICES - Public';

        default:
          return 'OFFICES - Public';
      }

    // case Slide.LAND_USE_OFFICES:
    //   switch (type) {
    //     case 'COMMERCIAL':
    //     case 'COMMERCIAL / INDUSTRIAL':
    //     case 'Commercial':
    //     case 'INDUSTRIAL':
    //     case 'Single-Use Commercial':
    //     case 'BUILDING':
    //     case 'FACTORY':
    //     case 'LABOURCAMP':
    //     case 'OPENAREA':
    //     case 'WAREHOUSE':
    //     case 'RESIDENTIAL - COMMERCIAL':
    //     case 'VILLA':
    //       return 'OFFICES - Public';
    //
    //     default:
    //       return 'OFFICES - Public';
    //   }

    case Slide.LAND_USE_HOSPITALITY:
      switch (type) {
        case 'Hotel':
          return 'HOTELS - Hotels';

        default:
          return 'HOTELS - Hotels';
      }
    default:
      return undefined;
  }
}
